import dataSource from '../database/data-source';
import { Product, ProductStatus } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductVariation } from '../entities/product-variation.entity';
import { Vendor } from '../entities/vendor.entity';
import { Department } from '../entities/department.entity';
import { VendorCategory } from '../entities/vendor-category.entity';
import { VendorCollection } from '../entities/vendor-collection.entity';

async function seed() {
  await dataSource.initialize();
  console.log('DataSource initialized.');

  // Delete existing products and relations
  await dataSource.query('DELETE FROM product_images');
  await dataSource.query('DELETE FROM product_variations');
  await dataSource.query('DELETE FROM cart_items');
  await dataSource.query('DELETE FROM order_items');
  await dataSource.query('DELETE FROM wishlists');
  await dataSource.query('DELETE FROM products');
  
  console.log('Existing products and relations deleted.');

  const vendorRepo = dataSource.getRepository(Vendor);
  const deptRepo = dataSource.getRepository(Department);
  const vendorCatRepo = dataSource.getRepository(VendorCategory);
  const vendorColRepo = dataSource.getRepository(VendorCollection);
  const productRepo = dataSource.getRepository(Product);
  const imageRepo = dataSource.getRepository(ProductImage);

  const vendors = await vendorRepo.find({ order: { id: 'ASC' }, take: 1 });
  const vendor = vendors[0];
  if (!vendor) {
    console.error('No vendor found. Please run the main seeder first.');
    process.exit(1);
  }

  const depts = await deptRepo.find();
  let cats = await vendorCatRepo.find({ where: { vendorId: vendor.id } });
  let cols = await vendorColRepo.find({ where: { vendorId: vendor.id } });

  if (cats.length === 0) cats = await vendorCatRepo.find({ take: 1 });
  if (cols.length === 0) cols = await vendorColRepo.find({ take: 1 });

  if (depts.length === 0 || cats.length === 0 || cols.length === 0) {
    console.error(`Missing metadata. depts: ${depts.length}, cats: ${cats.length}, cols: ${cols.length}`);
    process.exit(1);
  }

  const getDept = (name: string) => depts.find(d => d.slug.includes(name))?.id || depts[0].id;

  // Real products data
  const realProducts = [
    {
      nameEn: 'Sony WH-1000XM5 Wireless Headphones',
      nameAr: 'سماعات سوني WH-1000XM5 اللاسلكية',
      descriptionEn: 'Industry leading noise canceling with two processors and eight microphones for unprecedented noise canceling.',
      descriptionAr: 'سماعات رائدة في عزل الضوضاء مع معالجين وثمانية ميكروفونات لعزل ضوضاء غير مسبوق.',
      price: 398.00,
      department: 'electronics',
      images: [
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800'
      ],
      rating: 4.8,
      reviews: 120,
    },
    {
      nameEn: 'Apple MacBook Pro M3 Max 14"',
      nameAr: 'أبل ماك بوك برو M3 ماكس ١٤ بوصة',
      descriptionEn: 'The most advanced Mac for pros. Supercharged by M3 Max with a 14-core CPU and 30-core GPU.',
      descriptionAr: 'جهاز ماك الأكثر تطوراً للمحترفين. مزود بشريحة M3 Max مع وحدة معالجة مركزية بـ ١٤ نواة ووحدة معالجة رسومات بـ ٣٠ نواة.',
      price: 3199.00,
      department: 'electronics',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800'
      ],
      rating: 4.9,
      reviews: 85,
    },
    {
      nameEn: 'Samsung 49" Odyssey OLED G9 Curved Monitor',
      nameAr: 'شاشة سامسونج أوديسي OLED G9 المنحنية ٤٩ بوصة',
      descriptionEn: 'Dual QHD Curved Smart Gaming Monitor with 240Hz refresh rate and 0.03ms response time.',
      descriptionAr: 'شاشة ألعاب ذكية منحنية مزدوجة QHD مع معدل تحديث ٢٤٠ هرتز ووقت استجابة ٠.٠٣ ملي ثانية.',
      price: 1599.99,
      department: 'electronics',
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800',
        'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?q=80&w=800'
      ],
      rating: 4.7,
      reviews: 42,
    },
    {
      nameEn: 'Mens Classic Leather Jacket',
      nameAr: 'جاكيت جلد كلاسيكي للرجال',
      descriptionEn: 'Premium full-grain leather motorcycle jacket with quilted lining and vintage finish.',
      descriptionAr: 'جاكيت دراجة نارية من الجلد الطبيعي الفاخر مع بطانة مبطنة ولمسة كلاسيكية.',
      price: 245.00,
      department: 'fashion',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800',
        'https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=800'
      ],
      rating: 4.6,
      reviews: 230,
    },
    {
      nameEn: 'Nike Air Max 270',
      nameAr: 'حذاء نايك إير ماكس ٢٧٠',
      descriptionEn: 'Men\'s running shoes featuring the first-ever Max Air unit created specifically for Nike Sportswear.',
      descriptionAr: 'حذاء جري للرجال يتميز بأول وحدة Max Air على الإطلاق تم تصميمها خصيصاً للملابس الرياضية من نايك.',
      price: 160.00,
      department: 'fashion',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800'
      ],
      rating: 4.8,
      reviews: 412,
    },
    {
      nameEn: 'Breville Barista Express Espresso Machine',
      nameAr: 'ماكينة الإسبريسو بريفيل باريستا إكسبريس',
      descriptionEn: 'Create third wave specialty coffee at home – from bean to espresso in less than a minute.',
      descriptionAr: 'اصنع قهوة مختصة من الموجة الثالثة في المنزل - من الحبة إلى الإسبريسو في أقل من دقيقة.',
      price: 699.95,
      department: 'home',
      images: [
        'https://images.unsplash.com/photo-1520209268518-aec60b8bb5ca?q=80&w=800',
        'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800'
      ],
      rating: 4.9,
      reviews: 512,
    },
    {
      nameEn: 'Vitamix 5200 Professional-Grade Blender',
      nameAr: 'خلاط فيتاميكس ٥٢٠٠ الاحترافي',
      descriptionEn: '64 oz. container is ideal for blending medium to large batches. Self-cleaning in 60 seconds.',
      descriptionAr: 'وعاء سعة ٦٤ أونصة مثالي لخلط الكميات المتوسطة إلى الكبيرة. ينظف نفسه في ٦٠ ثانية.',
      price: 479.95,
      department: 'home',
      images: [
        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800',
        'https://images.unsplash.com/photo-1606915159020-f56ec568c0b5?q=80&w=800'
      ],
      rating: 4.7,
      reviews: 320,
    },
    {
      nameEn: 'Dyson V15 Detect Cordless Vacuum',
      nameAr: 'مكنسة دايسون V15 ديتكت اللاسلكية',
      descriptionEn: 'Intelligently optimizes suction and run time based on dust level and floor type.',
      descriptionAr: 'تعمل بذكاء على تحسين الشفط ووقت التشغيل بناءً على مستوى الغبار ونوع الأرضية.',
      price: 749.99,
      department: 'home',
      images: [
        'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800',
        'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?q=80&w=800'
      ],
      rating: 4.8,
      reviews: 215,
    },
    {
      nameEn: 'Ray-Ban Classic Aviator Sunglasses',
      nameAr: 'نظارات ريبان أفياتور الكلاسيكية',
      descriptionEn: 'Currently one of the most iconic sunglass models in the world. Classic gold frame with G-15 green lenses.',
      descriptionAr: 'حالياً أحد أكثر موديلات النظارات الشمسية شهرة في العالم. إطار ذهبي كلاسيكي مع عدسات G-15 خضراء.',
      price: 161.00,
      department: 'fashion',
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
        'https://images.unsplash.com/photo-1508296695146-257a814050b4?q=80&w=800'
      ],
      rating: 4.5,
      reviews: 89,
    },
    {
      nameEn: 'Logitech MX Master 3S Wireless Mouse',
      nameAr: 'ماوس لوجيتيك إم إكس ماستر 3 إس اللاسلكي',
      descriptionEn: 'Feel every moment of your workflow with even more precision, tactility, and performance.',
      descriptionAr: 'اشعر بكل لحظة في سير عملك بدقة ولمس وأداء أفضل بكثير.',
      price: 99.99,
      department: 'electronics',
      images: [
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c392c?q=80&w=800',
        'https://images.unsplash.com/photo-1527814050087-37938154791f?q=80&w=800'
      ],
      rating: 4.9,
      reviews: 1450,
    },
    {
      nameEn: 'Yeti Rambler 20 oz Tumbler',
      nameAr: 'كوب يتي رامبلر الحافظ للحرارة',
      descriptionEn: 'Stainless Steel, Vacuum Insulated with MagSlider Lid.',
      descriptionAr: 'ستانلس ستيل، معزول بتفريغ الهواء مع غطاء MagSlider.',
      price: 35.00,
      department: 'home',
      images: [
        'https://images.unsplash.com/photo-1614945415392-162e245a195e?q=80&w=800',
        'https://images.unsplash.com/photo-1605342416194-e3dc164a6f23?q=80&w=800'
      ],
      rating: 4.8,
      reviews: 890,
    },
    {
      nameEn: 'Oculus Quest 2 Advanced VR Headset',
      nameAr: 'نظارة الواقع الافتراضي أوكولوس كويست ٢',
      descriptionEn: 'All-In-One Virtual Reality Headset — 128 GB.',
      descriptionAr: 'نظارة واقع افتراضي متكاملة — ١٢٨ جيجابايت.',
      price: 299.00,
      department: 'electronics',
      images: [
        'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800',
        'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=800'
      ],
      rating: 4.7,
      reviews: 520,
    }
  ];

  for (let i = 0; i < realProducts.length; i++) {
    const p = realProducts[i];
    const slug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + i;
    
    const prod = productRepo.create({
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      slug: slug,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      basePrice: p.price,
      vendorId: vendor.id,
      departmentId: getDept(p.department),
      vendorCategoryId: cats[0].id,
      vendorCollectionId: cols[0].id,
      status: ProductStatus.APPROVED,
      isFeatured: i < 4, // Make first 4 featured
      rating: 0,
      reviewCount: 0,
    });
    
    const savedProd = await productRepo.save(prod);
    
    for (let j = 0; j < p.images.length; j++) {
      const img = imageRepo.create({
        productId: savedProd.id,
        imageUrl: p.images[j],
        isPrimary: j === 0,
        sortOrder: j,
      });
      await imageRepo.save(img);
    }
    
    console.log(`Added: ${p.nameEn}`);
  }
  
  console.log('Successfully seeded real products!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
