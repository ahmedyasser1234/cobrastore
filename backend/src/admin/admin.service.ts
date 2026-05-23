import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual, Between } from 'typeorm';
import { User, UserStatus, UserRole } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { Product, ProductStatus } from '../entities/product.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { VendorPayout, PayoutStatus } from '../entities/vendor-payout.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(AuditLog) private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(VendorPayout) private payoutRepository: Repository<VendorPayout>,
    @InjectRepository(SystemSetting) private settingRepository: Repository<SystemSetting>,
    private usersService: UsersService,
  ) {}

  async createUser(userData: any, adminId: string) {
    const user = await this.usersService.create(userData);
    await this.logAction(adminId, 'CREATE_USER', user.id, { email: user.email, role: user.role });
    return user;
  }

  async logAction(userId: string, action: string, targetId?: string, details?: any) {
    const log = this.auditLogRepository.create({
      userId,
      action,
      targetId,
      details,
    });
    await this.auditLogRepository.save(log);
  }

  async updateVendorCommission(vendorId: string, percentage: number, adminId: string) {
    await this.vendorRepository.update(vendorId, { commissionPercentage: percentage });
    await this.logAction(adminId, 'UPDATE_COMMISSION', vendorId, { percentage });
  }

  async getPendingProducts() {
    return this.productRepository.find({
      where: { status: ProductStatus.PENDING },
      relations: ['vendor'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateProductStatus(productId: string, status: ProductStatus, adminId: string) {
    await this.productRepository.update(productId, { status });
    await this.logAction(adminId, status === ProductStatus.APPROVED ? 'APPROVE_PRODUCT' : 'REJECT_PRODUCT', productId);
  }

  async getPayouts() {
    return this.payoutRepository.find({
      relations: ['vendor'],
      order: { createdAt: 'DESC' }
    });
  }

  async updatePayoutStatus(payoutId: string, status: PayoutStatus, adminId: string) {
    await this.payoutRepository.update(payoutId, { status });
    await this.logAction(adminId, 'UPDATE_PAYOUT_STATUS', payoutId, { status });
  }

  async getAuditLogs() {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100
    });
  }

  async getStats(): Promise<any> {
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      userCount, userCountPrev,
      vendorCount, vendorCountPrev,
      productCount,
      ordersCurrent, ordersPrev
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { createdAt: LessThan(firstDayCurrentMonth) } as any }),
      this.vendorRepository.count(),
      this.vendorRepository.count({ where: { createdAt: LessThan(firstDayCurrentMonth) } as any }),
      this.productRepository.count(),
      this.orderRepository.find({ where: { status: OrderStatus.PAID, createdAt: MoreThanOrEqual(firstDayCurrentMonth) } }),
      this.orderRepository.find({ where: { status: OrderStatus.PAID, createdAt: Between(firstDayPrevMonth, firstDayCurrentMonth) } }),
    ]);

    const totalSalesCurrent = ordersCurrent.reduce((sum, order) => sum + Number(order.total), 0);
    const totalSalesPrev = ordersPrev.reduce((sum, order) => sum + Number(order.total), 0);

    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const diff = ((curr - prev) / prev) * 100;
      return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
    };

    return {
      totalUsers: userCount,
      totalVendors: vendorCount,
      totalProducts: productCount,
      totalSales: totalSalesCurrent,
      totalOrders: ordersCurrent.length,
      activeUsers: userCount,
      trends: {
        sales: calculateTrend(totalSalesCurrent, totalSalesPrev),
        users: calculateTrend(userCount, userCountPrev),
        orders: calculateTrend(ordersCurrent.length, ordersPrev.length),
        vendors: calculateTrend(vendorCount, vendorCountPrev)
      }
    };
  }

  async getMonthlyRevenue(): Promise<any> {
    const data = await this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_TRUNC('month', order.createdAt)", 'month')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.status = :status', { status: OrderStatus.PAID })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
    
    return data;
  }

  async getUsers(role?: string, search?: string): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');
    
    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    return query.orderBy('user.createdAt', 'DESC').getMany();
  }

  async getVendors(search?: string): Promise<Vendor[]> {
    const query = this.vendorRepository.createQueryBuilder('vendor');
    
    if (search) {
      query.andWhere('(vendor.storeNameEn ILIKE :search OR vendor.storeNameAr ILIKE :search OR vendor.slug ILIKE :search)', { search: `%${search}%` });
    }

    return query.orderBy('vendor.createdAt', 'DESC').getMany();
  }

  async getProducts(search?: string): Promise<any> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.vendor', 'vendor')
      .leftJoinAndSelect('product.vendorCategory', 'vendorCategory')
      .leftJoinAndSelect('product.images', 'images');
    
    if (search) {
      query.andWhere('(product.name ILIKE :search OR product.slug ILIKE :search)', { search: `%${search}%` });
    }

    const [items, total] = await query.orderBy('product.createdAt', 'DESC').getManyAndCount();
    return { items, total };
  }

  async deleteProduct(productId: string, adminId: string) {
    await this.productRepository.delete(productId);
    await this.logAction(adminId, 'DELETE_PRODUCT', productId);
  }

  async deleteVendor(vendorId: string, adminId: string) {
    await this.vendorRepository.delete(vendorId);
    await this.logAction(adminId, 'DELETE_VENDOR', vendorId);
  }

  async updateVendorStatus(vendorId: string, status: string, adminId: string) {
    await this.vendorRepository.update(vendorId, { status: status as any });
    await this.logAction(adminId, 'UPDATE_VENDOR_STATUS', vendorId, { status });
  }

  async updateUserRole(userId: string, role: any, adminId: string) {
    await this.userRepository.update(userId, { role });
    await this.logAction(adminId, 'UPDATE_USER_ROLE', userId, { role });
  }

  async updateUserStatus(userId: string, status: UserStatus, adminId: string) {
    await this.userRepository.update(userId, { status });
    await this.logAction(adminId, 'UPDATE_USER_STATUS', userId, { status });
  }

  async deleteUser(userId: string, adminId: string) {
    await this.userRepository.delete(userId);
    await this.logAction(adminId, 'DELETE_USER', userId);
  }

  async getOrders(search?: string): Promise<Order[]> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');
    
    if (search) {
      query.andWhere('(user.name ILIKE :search OR order.id::text ILIKE :search)', { search: `%${search}%` });
    }

    return query.orderBy('order.createdAt', 'DESC').getMany();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, adminId: string) {
    await this.orderRepository.update(orderId, { status });
    await this.logAction(adminId, 'UPDATE_ORDER_STATUS', orderId, { status });
  }

  async getNotifications() {
    const [orders, vendors, payouts] = await Promise.all([
      this.orderRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      this.vendorRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      this.payoutRepository.find({
        relations: ['vendor'],
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const notifications: any[] = [];

    // Map orders
    orders.forEach((order) => {
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'New Order Received',
        titleAr: 'طلب جديد مستلم',
        desc: `Order #${order.id.toString().substring(0, 8)} from ${order.user?.name || 'Guest'}`,
        descAr: `طلب رقم #${order.id.toString().substring(0, 8)} من ${order.user?.name || 'زائر'}`,
        createdAt: order.createdAt,
      });
    });

    // Map vendors
    vendors.forEach((vendor) => {
      notifications.push({
        id: `vendor-${vendor.id}`,
        type: 'user',
        title: 'New Vendor Application',
        titleAr: 'طلب انضمام تاجر جديد',
        desc: `Store "${vendor.storeNameEn || vendor.storeNameAr}" has registered (Status: ${vendor.status})`,
        descAr: `متجر "${vendor.storeNameAr || vendor.storeNameEn}" قام بالتسجيل (الحالة: ${vendor.status})`,
        createdAt: vendor.createdAt,
      });
    });

    // Map payouts
    payouts.forEach((payout) => {
      notifications.push({
        id: `payout-${payout.id}`,
        type: 'success',
        title: 'Payout Status Updated',
        titleAr: 'تحديث حالة الدفعة المالية',
        desc: `Payout of ${payout.amount} for store "${payout.vendor?.storeNameEn || payout.vendor?.storeNameAr || 'Vendor'}" is ${payout.status}`,
        descAr: `دفعة مالية بقيمة ${payout.amount} لمتجر "${payout.vendor?.storeNameAr || payout.vendor?.storeNameEn || 'التاجر'}" بحالة ${payout.status}`,
        createdAt: payout.createdAt,
      });
    });

    // Sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to top 20 notifications
    return notifications.slice(0, 20);
  }

  async createVendor(vendorData: any, adminId: string) {
    // 1. Create the user with vendor role and active status
    const user = await this.usersService.create({
      name: vendorData.storeNameEn || vendorData.storeNameAr,
      email: vendorData.email,
      password: vendorData.password,
      role: UserRole.VENDOR,
      status: UserStatus.ACTIVE,
    });

    // Generate unique slug from storeName
    let baseSlug = (vendorData.storeNameEn || vendorData.storeNameAr || 'store')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Ensure slug uniqueness
    let slug = baseSlug;
    let count = 1;
    while (await this.vendorRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 2. Create the Vendor profile
    const vendor = this.vendorRepository.create({
      storeNameEn: vendorData.storeNameEn || vendorData.storeName,
      storeNameAr: vendorData.storeNameAr || vendorData.storeName,
      descriptionEn: vendorData.descriptionEn || '',
      descriptionAr: vendorData.descriptionAr || '',
      slug,
      userId: user.id,
      status: 'approved', // Automatically approved by Admin
    } as any);

    const savedVendor = await this.vendorRepository.save(vendor) as any;

    // 3. Log action
    await this.logAction(adminId, 'CREATE_VENDOR', savedVendor.id, {
      storeName: vendorData.storeNameEn || vendorData.storeNameAr,
      email: vendorData.email,
    });

    return savedVendor;
  }

  async getSettings() {
    const list = await this.settingRepository.find();
    const settingsObj: Record<string, string> = {};
    list.forEach((item) => {
      settingsObj[item.key] = item.value;
    });
    return settingsObj;
  }

  async updateSettings(settingsData: Record<string, any>) {
    const promises = Object.entries(settingsData).map(async ([key, value]) => {
      let setting = await this.settingRepository.findOne({ where: { key } });
      if (!setting) {
        setting = this.settingRepository.create({ key, value: value !== null && value !== undefined ? String(value) : '' });
      } else {
        setting.value = value !== null && value !== undefined ? String(value) : '';
      }
      return this.settingRepository.save(setting);
    });
    await Promise.all(promises);
    return this.getSettings();
  }
}
