import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { Department } from '../../entities/department.entity';
import { Category } from '../../entities/category.entity';
import { SubCategory } from '../../entities/sub-category.entity';
import { CategoryAttribute, AttributeType } from '../../entities/category-attribute.entity';
import { Vendor, VendorStatus } from '../../entities/vendor.entity';
import { VendorCategory } from '../../entities/vendor-category.entity';
import { Product, ProductType, ProductStatus } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { ProductVariation } from '../../entities/product-variation.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory) private readonly subCategoryRepo: Repository<SubCategory>,
    @InjectRepository(CategoryAttribute) private readonly attrRepo: Repository<CategoryAttribute>,
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(VendorCategory) private readonly vendorCategoryRepo: Repository<VendorCategory>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepo: Repository<ProductImage>,
    @InjectRepository(ProductVariation) private readonly productVariationRepo: Repository<ProductVariation>,
  ) {}

  async seed() {
    this.logger.log('Starting full taxonomy seed...');

    // 1. Wipe old taxonomy data
    try {
      await this.attrRepo.delete({});
      await this.subCategoryRepo.delete({});
      await this.categoryRepo.delete({});
      await this.deptRepo.delete({});
    } catch (e) {
      this.logger.warn(`Could not wipe old data (likely FK constraints): ${e.message}`);
    }

    // 2. Define standard E-Commerce Taxonomy
    const taxonomyData = [
      {
        dept: { nameEn: 'Fashion', nameAr: 'أزياء', slug: 'fashion', order: 1, imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050' },
        categories: [
          {
            cat: { nameEn: 'Clothing', nameAr: 'ملابس', slug: 'clothing' },
            subCats: [
              { nameEn: 'Men', nameAr: 'رجالي', slug: 'clothing-men' },
              { nameEn: 'Women', nameAr: 'حريمي', slug: 'clothing-women' },
              { nameEn: 'Kids', nameAr: 'أطفال', slug: 'clothing-kids' },
            ],
            attributes: [
              { nameEn: 'Color', nameAr: 'اللون', type: AttributeType.ATTRIBUTE, options: ['Red', 'Blue', 'Black', 'White', 'Green'] },
              { nameEn: 'Fabric', nameAr: 'القماش', type: AttributeType.ATTRIBUTE, options: ['Cotton', 'Polyester', 'Silk', 'Linen'] },
              { nameEn: 'Size', nameAr: 'المقاس', type: AttributeType.VARIANT, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
            ]
          },
          {
            cat: { nameEn: 'Shoes', nameAr: 'أحذية', slug: 'shoes' },
            subCats: [
              { nameEn: 'Sports', nameAr: 'رياضي', slug: 'shoes-sports' },
              { nameEn: 'Classic', nameAr: 'كلاسيك', slug: 'shoes-classic' },
            ],
            attributes: [
              { nameEn: 'Color', nameAr: 'اللون', type: AttributeType.ATTRIBUTE, options: ['Black', 'Brown', 'White', 'Navy'] },
              { nameEn: 'Material', nameAr: 'الخامة', type: AttributeType.ATTRIBUTE, options: ['Leather', 'Suede', 'Canvas'] },
              { nameEn: 'Shoe Size', nameAr: 'مقاس الحذاء', type: AttributeType.VARIANT, options: ['38', '39', '40', '41', '42', '43', '44'] },
            ]
          }
        ]
      },
      {
        dept: { nameEn: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', order: 2, imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661' },
        categories: [
          {
            cat: { nameEn: 'Mobiles', nameAr: 'موبايلات', slug: 'mobiles' },
            subCats: [
              { nameEn: 'Smartphones', nameAr: 'هواتف ذكية', slug: 'smartphones' },
              { nameEn: 'Tablets', nameAr: 'تابلت', slug: 'tablets' },
            ],
            attributes: [
              { nameEn: 'Processor', nameAr: 'المعالج', type: AttributeType.ATTRIBUTE, options: ['Snapdragon', 'Apple A', 'Exynos', 'MediaTek'] },
              { nameEn: 'Color', nameAr: 'اللون', type: AttributeType.ATTRIBUTE, options: ['Black', 'Silver', 'Gold', 'Blue'] },
              { nameEn: 'Storage', nameAr: 'مساحة التخزين', type: AttributeType.VARIANT, options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
              { nameEn: 'RAM', nameAr: 'الرامات', type: AttributeType.VARIANT, options: ['4GB', '6GB', '8GB', '12GB'] },
            ]
          },
          {
            cat: { nameEn: 'Laptops', nameAr: 'لابتوبات', slug: 'laptops' },
            subCats: [
              { nameEn: 'Gaming Laptops', nameAr: 'لابتوب ألعاب', slug: 'gaming-laptops' },
              { nameEn: 'Business Laptops', nameAr: 'لابتوب أعمال', slug: 'business-laptops' },
            ],
            attributes: [
              { nameEn: 'Processor', nameAr: 'المعالج', type: AttributeType.ATTRIBUTE, options: ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2'] },
              { nameEn: 'GPU', nameAr: 'كارت الشاشة', type: AttributeType.ATTRIBUTE, options: ['RTX 3060', 'RTX 4070', 'Integrated', 'Radeon'] },
              { nameEn: 'Screen Size', nameAr: 'حجم الشاشة', type: AttributeType.ATTRIBUTE, options: ['13.3"', '14"', '15.6"', '16"', '17.3"'] },
              { nameEn: 'RAM', nameAr: 'الرامات', type: AttributeType.VARIANT, options: ['8GB', '16GB', '32GB', '64GB'] },
              { nameEn: 'Storage', nameAr: 'مساحة التخزين', type: AttributeType.VARIANT, options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
            ]
          }
        ]
      },
      {
        dept: { nameEn: 'Furniture', nameAr: 'أثاث', slug: 'furniture', order: 3, imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d' },
        categories: [
          {
            cat: { nameEn: 'Living Room', nameAr: 'غرفة المعيشة', slug: 'living-room' },
            subCats: [
              { nameEn: 'Sofas', nameAr: 'كنب', slug: 'sofas' },
              { nameEn: 'Tables', nameAr: 'طاولات', slug: 'tables' },
            ],
            attributes: [
              { nameEn: 'Material', nameAr: 'الخامة', type: AttributeType.ATTRIBUTE, options: ['Wood', 'Metal', 'Glass', 'Fabric'] },
              { nameEn: 'Color', nameAr: 'اللون', type: AttributeType.ATTRIBUTE, options: ['Beige', 'Grey', 'Black', 'White', 'Brown'] },
              { nameEn: 'Size', nameAr: 'الحجم', type: AttributeType.VARIANT, options: ['Small', 'Medium', 'Large', 'Extra Large'] },
            ]
          }
        ]
      },
      {
        dept: { nameEn: 'Supermarket', nameAr: 'سوبر ماركت', slug: 'supermarket', order: 4, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e' },
        categories: [
          {
            cat: { nameEn: 'Drinks', nameAr: 'مشروبات', slug: 'drinks' },
            subCats: [
              { nameEn: 'Sodas', nameAr: 'مياه غازية', slug: 'sodas' },
              { nameEn: 'Juices', nameAr: 'عصائر', slug: 'juices' },
            ],
            attributes: [
              { nameEn: 'Flavor', nameAr: 'النكهة', type: AttributeType.ATTRIBUTE, options: ['Cola', 'Orange', 'Apple', 'Mango', 'Lemon'] },
              { nameEn: 'Sugar Free', nameAr: 'خالي من السكر', type: AttributeType.ATTRIBUTE, options: ['Yes', 'No'] },
              { nameEn: 'Volume', nameAr: 'الحجم', type: AttributeType.VARIANT, options: ['250ML', '330ML', '500ML', '1L', '2L'] },
            ]
          }
        ]
      },
      {
        dept: { nameEn: 'Books', nameAr: 'كتب', slug: 'books', order: 5, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f' },
        categories: [
          {
            cat: { nameEn: 'Novels', nameAr: 'روايات', slug: 'novels' },
            subCats: [
              { nameEn: 'Fiction', nameAr: 'خيال', slug: 'fiction' },
              { nameEn: 'Mystery', nameAr: 'غموض', slug: 'mystery' },
            ],
            attributes: [
              { nameEn: 'Language', nameAr: 'اللغة', type: AttributeType.ATTRIBUTE, options: ['Arabic', 'English', 'French'] },
              { nameEn: 'Publisher', nameAr: 'دار النشر', type: AttributeType.ATTRIBUTE, options: ['Penguin', 'Dar Al Shorouk', 'Macmillan'] },
              { nameEn: 'Cover Type', nameAr: 'نوع الغلاف', type: AttributeType.VARIANT, options: ['Hard Cover', 'Soft Cover'] },
            ]
          }
        ]
      }
    ];

    // 3. Execute Seeding
    for (const data of taxonomyData) {
      // Create Department
      let dept = await this.deptRepo.findOne({ where: { slug: data.dept.slug } });
      if (!dept) dept = await this.deptRepo.save(this.deptRepo.create(data.dept));
      else await this.deptRepo.update(dept.id, data.dept);

      for (const catData of data.categories) {
        // Create Category
        let category = await this.categoryRepo.findOne({ where: { slug: catData.cat.slug } });
        if (!category) {
          category = await this.categoryRepo.save(
            this.categoryRepo.create({ ...catData.cat, departmentId: dept.id })
          );
        } else {
          await this.categoryRepo.update(category.id, { ...catData.cat, departmentId: dept.id });
        }

        // Create SubCategories
        for (const subCat of catData.subCats) {
          let subCategory = await this.subCategoryRepo.findOne({ where: { slug: subCat.slug } });
          if (!subCategory) {
            await this.subCategoryRepo.save(
              this.subCategoryRepo.create({ ...subCat, categoryId: category.id })
            );
          }
        }

        // Create Attributes & Variants
        for (const attr of catData.attributes) {
          let attribute = await this.attrRepo.findOne({ where: { nameEn: attr.nameEn, categoryId: category.id } });
          if (!attribute) {
            await this.attrRepo.save(
              this.attrRepo.create({ ...attr, categoryId: category.id })
            );
          }
        }
      }
    }

    this.logger.log('Taxonomy Seeding Completed!');

    return { message: 'Database wiped and re-seeded with Multi-Vendor Global E-Commerce Taxonomy and Dynamic Attributes.' };
  }

  async test() {
    return this.userRepo.query("SELECT table_name, column_name FROM information_schema.key_column_usage WHERE constraint_name = 'UQ_97672ac88f789774dd47f7c8be3'");
  }

  async seedVendorsAndProducts() {
    this.logger.log('Starting full vendors and products seed...');

    const defaultPassword = await bcrypt.hash('123456', 10);

    // 1. Define the 7 Stores
    const storesData = [
      {
        user: { name: 'Nike Official', email: 'vendor1@store.com' },
        vendor: { storeNameEn: 'Nike Store', storeNameAr: 'متجر نايك', slug: 'nike-store', phone: '01000000001', coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200' },
        deptSlug: 'fashion', catSlug: 'shoes', subCatSlug: 'shoes-sports', aiContextType: 'shoes',
        vendorCat: { nameEn: 'Running Shoes', nameAr: 'أحذية جري', slug: 'nike-running' },
        products: [
          {
            nameEn: 'Nike Air Max 270', nameAr: 'حذاء نايك إير ماكس 270', slug: 'nike-air-max-270-1',
            descEn: 'Running shoe featuring the first ever Max Air unit.', descAr: 'حذاء جري للرجال يتميز بأول وحدة Max Air على الإطلاق.',
            basePrice: 2000, salePrice: 1600, discount: 20, type: ProductType.VARIABLE, rating: 4.8, reviewCount: 128, stock: 100,
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa'],
            variations: [
              { name: 'Red-42', sku: 'NK-AM-R42', price: 1600, stock: 15, attributes: { Color: 'Red', 'Shoe Size': '42' } },
              { name: 'Red-43', sku: 'NK-AM-R43', price: 1600, stock: 10, attributes: { Color: 'Red', 'Shoe Size': '43' } },
              { name: 'Black-42', sku: 'NK-AM-B42', price: 1600, stock: 5, attributes: { Color: 'Black', 'Shoe Size': '42' } },
            ]
          }
        ]
      },
      {
        user: { name: 'Zara Official', email: 'vendor2@store.com' },
        vendor: { storeNameEn: 'Zara Store', storeNameAr: 'متجر زارا', slug: 'zara-store', phone: '01000000002', coverImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200' },
        deptSlug: 'fashion', catSlug: 'clothing', subCatSlug: 'clothing-men', aiContextType: 'clothing',
        vendorCat: { nameEn: 'Men Jackets', nameAr: 'جواكيت رجالي', slug: 'zara-jackets' },
        products: [
          {
            nameEn: 'Zara Leather Jacket', nameAr: 'جاكيت جلد زارا', slug: 'zara-leather-jacket-1',
            descEn: 'Premium black leather jacket for winter.', descAr: 'جاكيت جلد أسود فاخر لفصل الشتاء.',
            basePrice: 3500, discount: 0, type: ProductType.VARIABLE, rating: 4.5, reviewCount: 45, stock: 50,
            images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5', 'https://images.unsplash.com/photo-1520975954732-57dd22299614'],
            variations: [
              { name: 'Black-L', sku: 'ZR-LJ-BL', price: 3500, stock: 20, attributes: { Color: 'Black', Size: 'L' } },
              { name: 'Black-XL', sku: 'ZR-LJ-BXL', price: 3500, stock: 10, attributes: { Color: 'Black', Size: 'XL' } },
            ]
          }
        ]
      },
      {
        user: { name: 'Apple Store', email: 'vendor3@store.com' },
        vendor: { storeNameEn: 'Apple Official', storeNameAr: 'أبل الرسمي', slug: 'apple-store', phone: '01000000003', coverImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1200' },
        deptSlug: 'electronics', catSlug: 'mobiles', subCatSlug: 'smartphones', aiContextType: 'technical',
        vendorCat: { nameEn: 'iPhones', nameAr: 'أيفون', slug: 'apple-iphones' },
        products: [
          {
            nameEn: 'iPhone 15 Pro Max', nameAr: 'أيفون 15 برو ماكس', slug: 'iphone-15-pro-max',
            descEn: 'Titanium design with A17 Pro chip.', descAr: 'تصميم من التيتانيوم مع شريحة A17 Pro القوية.',
            basePrice: 60000, discount: 0, type: ProductType.VARIABLE, rating: 4.9, reviewCount: 500, stock: 30,
            images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569', 'https://images.unsplash.com/photo-1696446701796-da61225697cc'],
            variations: [
              { name: 'Natural Titanium 256GB', sku: 'IP15-NT-256', price: 60000, stock: 15, attributes: { Color: 'Silver', Storage: '256GB', RAM: '8GB' } },
              { name: 'Black Titanium 512GB', sku: 'IP15-BT-512', price: 70000, stock: 5, attributes: { Color: 'Black', Storage: '512GB', RAM: '8GB' } },
            ]
          }
        ]
      },
      {
        user: { name: 'Samsung Store', email: 'vendor4@store.com' },
        vendor: { storeNameEn: 'Samsung Official', storeNameAr: 'سامسونج الرسمي', slug: 'samsung-store', phone: '01000000004', coverImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1200' },
        deptSlug: 'electronics', catSlug: 'mobiles', subCatSlug: 'smartphones', aiContextType: 'technical',
        vendorCat: { nameEn: 'Galaxy S Series', nameAr: 'سلسلة جالاكسي إس', slug: 'samsung-s-series' },
        products: [
          {
            nameEn: 'Samsung Galaxy S24 Ultra', nameAr: 'سامسونج جالاكسي إس 24 ألترا', slug: 'samsung-s24-ultra',
            descEn: 'Galaxy AI is here.', descAr: 'عصر الذكاء الاصطناعي مع جالاكسي ألترا الجديد.',
            basePrice: 55000, discount: 5, salePrice: 52250, type: ProductType.VARIABLE, rating: 4.8, reviewCount: 320, stock: 40,
            images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c', 'https://images.unsplash.com/photo-1610945265064-3200fce9d34e'],
            variations: [
              { name: 'Titanium Gray 256GB', sku: 'S24U-TG-256', price: 52250, stock: 20, attributes: { Color: 'Gray', Storage: '256GB', RAM: '12GB' } },
            ]
          }
        ]
      },
      {
        user: { name: 'IKEA Egypt', email: 'vendor5@store.com' },
        vendor: { storeNameEn: 'IKEA', storeNameAr: 'ايكيا', slug: 'ikea-store', phone: '01000000005', coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200' },
        deptSlug: 'furniture', catSlug: 'living-room', subCatSlug: 'sofas', aiContextType: 'general',
        vendorCat: { nameEn: 'Modern Sofas', nameAr: 'كنب مودرن', slug: 'ikea-modern-sofas' },
        products: [
          {
            nameEn: 'KIVIK 3-seat sofa', nameAr: 'كنبة كيفيك 3 مقاعد', slug: 'ikea-kivik-sofa',
            descEn: 'Cozy and spacious sofa.', descAr: 'كنبة واسعة ومريحة لغرفة المعيشة.',
            basePrice: 12000, discount: 10, salePrice: 10800, type: ProductType.VARIABLE, rating: 4.6, reviewCount: 85, stock: 15,
            images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e'],
            variations: [
              { name: 'Grey', sku: 'IK-KV-GRY', price: 10800, stock: 5, attributes: { Color: 'Grey', Material: 'Fabric', Size: 'Large' } },
              { name: 'Beige', sku: 'IK-KV-BGE', price: 10800, stock: 2, attributes: { Color: 'Beige', Material: 'Fabric', Size: 'Large' } },
            ]
          }
        ]
      },
      {
        user: { name: 'Carrefour Supermarket', email: 'vendor6@store.com' },
        vendor: { storeNameEn: 'Carrefour', storeNameAr: 'كارفور', slug: 'carrefour-store', phone: '01000000006', coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200' },
        deptSlug: 'supermarket', catSlug: 'drinks', subCatSlug: 'sodas', aiContextType: 'general',
        vendorCat: { nameEn: 'Soft Drinks', nameAr: 'مياه غازية', slug: 'carrefour-soft-drinks' },
        products: [
          {
            nameEn: 'Coca-Cola Can Pack', nameAr: 'كرتونة كانز كوكاكولا', slug: 'coca-cola-pack-6',
            descEn: 'Pack of 6 Coca-Cola 330ml cans.', descAr: 'عبوة تحتوي على 6 كانز كوكاكولا 330 مل.',
            basePrice: 60, discount: 0, type: ProductType.VARIABLE, rating: 4.7, reviewCount: 1500, stock: 500,
            images: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97', 'https://images.unsplash.com/photo-1554866585-cd94860890b7'],
            variations: [
              { name: 'Original 330ML', sku: 'CC-ORG-330', price: 60, stock: 200, attributes: { Flavor: 'Cola', 'Sugar Free': 'No', Volume: '330ML' } },
              { name: 'Zero 330ML', sku: 'CC-ZRO-330', price: 60, stock: 100, attributes: { Flavor: 'Cola', 'Sugar Free': 'Yes', Volume: '330ML' } },
            ]
          }
        ]
      },
      {
        user: { name: 'Diwan Bookstores', email: 'vendor7@store.com' },
        vendor: { storeNameEn: 'Diwan', storeNameAr: 'ديوان', slug: 'diwan-store', phone: '01000000007', coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1200' },
        deptSlug: 'books', catSlug: 'novels', subCatSlug: 'fiction', aiContextType: 'general',
        vendorCat: { nameEn: 'Best Sellers', nameAr: 'الأكثر مبيعاً', slug: 'diwan-best-sellers' },
        products: [
          {
            nameEn: 'The Alchemist', nameAr: 'الخيميائي', slug: 'book-alchemist',
            descEn: 'A magical story of following your dreams by Paulo Coelho.', descAr: 'رواية سحرية عن تتبع أحلامك للكاتب باولو كويلو.',
            basePrice: 250, discount: 10, salePrice: 225, type: ProductType.VARIABLE, rating: 4.9, reviewCount: 2000, stock: 100,
            images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f'],
            variations: [
              { name: 'Arabic Hard Cover', sku: 'BOK-ALC-AR-HC', price: 250, stock: 30, attributes: { Language: 'Arabic', 'Cover Type': 'Hard Cover' } },
              { name: 'English Soft Cover', sku: 'BOK-ALC-EN-SC', price: 200, stock: 50, attributes: { Language: 'English', 'Cover Type': 'Soft Cover' } },
            ]
          }
        ]
      }
    ];

    try {
      await this.productVariationRepo.query('TRUNCATE TABLE product_variations CASCADE');
      await this.productImageRepo.query('TRUNCATE TABLE product_images CASCADE');
      await this.productRepo.query('TRUNCATE TABLE products CASCADE');
      await this.vendorCategoryRepo.query('TRUNCATE TABLE vendor_categories CASCADE');
      await this.vendorRepo.query('TRUNCATE TABLE vendors CASCADE');
      for (const store of storesData) {
        await this.userRepo.delete({ email: store.user.email });
      }
    } catch (e) {
      this.logger.warn(`Wipe failed: ${e.message}`);
      throw e;
    }

    for (const store of storesData) {
      try {
        // 1. Create User
        let user;
        try {
          user = await this.userRepo.save(this.userRepo.create({
            email: store.user.email,
            password: defaultPassword,
            name: store.user.name,
            role: UserRole.VENDOR,
            status: UserStatus.ACTIVE
          }));
        } catch (e) {
          throw new Error(`User Creation Failed: ${e.message} | Detail: ${e.detail}`);
        }

        let vendor;
        try {
          vendor = await this.vendorRepo.save(this.vendorRepo.create({
            userId: user.id,
            storeNameEn: store.vendor.storeNameEn,
            storeNameAr: store.vendor.storeNameAr,
            slug: store.vendor.slug,
            contactPhone: store.vendor.phone,
            bannerUrl: store.vendor.coverImage,
            status: VendorStatus.APPROVED
          }));
        } catch (e) {
          throw new Error(`Vendor Creation Failed: ${e.message} | Detail: ${e.detail}`);
        }

        // 3. Resolve Taxonomy References
        const dept = await this.deptRepo.findOne({ where: { slug: store.deptSlug } });
        const cat = await this.categoryRepo.findOne({ where: { slug: store.catSlug } });
        const subCat = await this.subCategoryRepo.findOne({ where: { slug: store.subCatSlug } });

        if (!dept || !cat) {
          this.logger.warn(`Could not find dept/cat for store ${vendor.storeNameEn}. Skipping products.`);
          continue;
        }

        // 4. Create Vendor Category
        let vCat;
        try {
          vCat = await this.vendorCategoryRepo.save(this.vendorCategoryRepo.create({
            vendorId: vendor.id,
            nameEn: store.vendorCat.nameEn,
            nameAr: store.vendorCat.nameAr,
            slug: store.vendorCat.slug,
          }));
        } catch (e) {
          throw new Error(`VendorCategory Creation Failed: ${e.message} | Detail: ${e.detail}`);
        }

        // 5. Create Products
        for (const pData of store.products) {
          let product;
          try {
            product = await this.productRepo.save(this.productRepo.create({
              vendorId: vendor.id,
              departmentId: dept.id,
              subCategoryId: subCat?.id,
              vendorCategoryId: vCat.id,
              nameEn: pData.nameEn,
              nameAr: pData.nameAr,
              slug: pData.slug,
              descriptionEn: pData.descEn,
              descriptionAr: pData.descAr,
              basePrice: pData.basePrice,
              salePrice: (pData as any).salePrice || pData.basePrice,
              discount: pData.discount,
              type: pData.type,
              status: ProductStatus.APPROVED,
              rating: pData.rating,
              reviewCount: pData.reviewCount,
              stock: pData.stock,
              aiContextType: store.aiContextType
            }));
          } catch (e) {
            throw new Error(`Product Creation Failed: ${e.message} | Detail: ${e.detail}`);
          }

          // Images
          try {
            for (let i = 0; i < pData.images.length; i++) {
              await this.productImageRepo.save(this.productImageRepo.create({
                productId: product.id,
                imageUrl: pData.images[i],
                isPrimary: i === 0,
                sortOrder: i
              }));
            }
          } catch (e) {
            throw new Error(`Image Creation Failed: ${e.message} | Detail: ${e.detail}`);
          }

          // Variations
          try {
            for (const vData of pData.variations) {
              await this.productVariationRepo.save(this.productVariationRepo.create({
                productId: product.id,
                sku: vData.sku,
                price: vData.price,
                stock: vData.stock,
                attributes: vData.attributes
              }));
            }
          } catch (e) {
            throw new Error(`Variation Creation Failed: ${e.message} | Detail: ${e.detail}`);
          }
        }
      } catch (err) {
        this.logger.error(`FATAL LOOP ERROR on ${store.user.email}: \n${err.stack}`);
        throw err;
      }
    }

    this.logger.log('Vendors and Products Seeding Completed!');
    return { message: '7 specialized vendors and their products have been seeded successfully.' };
  }
}
