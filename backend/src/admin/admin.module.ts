import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { Product } from '../entities/product.entity';
import { Order } from '../entities/order.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { VendorPayout } from '../entities/vendor-payout.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vendor, Product, Order, AuditLog, VendorPayout, SystemSetting]),
    UsersModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
