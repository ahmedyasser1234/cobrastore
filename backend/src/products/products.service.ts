import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, Not } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { ProductVariation } from '../entities/product-variation.entity';
import { ProductImage } from '../entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariation)
    private variationRepository: Repository<ProductVariation>,
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
  ) {}

  async findAll(query: any): Promise<any> {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      department,
      collection,
      minPrice,
      maxPrice,
      vendorId,
      status,
      isFeatured,
      sort
    } = query;

    const where: any = {};
    if (status) {
      where.status = status;
    } else if (!vendorId) {
      where.status = ProductStatus.APPROVED;
    }

    if (category) where.vendorCategoryId = category;
    if (department) where.departmentId = department;
    if (collection) where.vendorCollectionId = collection;
    if (vendorId) where.vendorId = vendorId;
    if (isFeatured === 'true' || isFeatured === true) where.isFeatured = true;
    
    if (minPrice || maxPrice) {
      where.basePrice = Between(minPrice || 0, maxPrice || 9999999);
    }

    let order: any = { createdAt: 'DESC' };
    if (sort === 'name-asc') order = { nameEn: 'ASC' };
    else if (sort === 'name-desc') order = { nameEn: 'DESC' };
    else if (sort === 'price-low') order = { basePrice: 'ASC' };
    else if (sort === 'price-high') order = { basePrice: 'DESC' };
    else if (sort === 'rating-high') order = { rating: 'DESC' };
    else if (sort === 'best-selling') order = { reviewCount: 'DESC' };

    let finalWhere: any = where;
    if (search) {
      finalWhere = [
        { ...where, nameAr: ILike(`%${search}%`) },
        { ...where, nameEn: ILike(`%${search}%`) },
      ];
    }

    const [items, total] = await this.productsRepository.findAndCount({
      where: finalWhere,
      relations: ['images', 'department', 'vendorCategory', 'vendorCollection', 'vendor', 'variations', 'brand', 'subCategory'],
      take: limit,
      skip: (page - 1) * limit,
      order
    });

    return { items, total, page, lastPage: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ['images', 'department', 'vendorCategory', 'vendorCollection', 'vendor', 'variations', 'brand', 'subCategory']
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(vendorId: string, productData: any): Promise<Product> {
    const { variations, images, ...rest } = productData;
    
    const product = this.productsRepository.create({
      ...rest,
      vendorId,
      status: ProductStatus.APPROVED
    } as any);
    
    const savedProduct = await this.productsRepository.save(product) as any;

    if (variations && variations.length > 0) {
      const vObjs = variations.map(v => this.variationRepository.create({ ...v, productId: savedProduct.id }));
      await this.variationRepository.save(vObjs);
    }

    if (images && images.length > 0) {
      const iObjs = images.map(img => this.imageRepository.create({ ...img, productId: savedProduct.id }));
      await this.imageRepository.save(iObjs);
    }

    return this.findBySlug(savedProduct.slug);
  }

  async update(id: string, vendorId: string, updateData: any): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException();
    if (product.vendorId !== vendorId) throw new ForbiddenException();

    await this.productsRepository.update(id, updateData);
    return this.productsRepository.findOne({ where: { id }, relations: ['variations', 'images'] });
  }

  async adminUpdate(id: string, updateData: any): Promise<Product> {
    await this.productsRepository.update(id, updateData);
    return this.productsRepository.findOne({ where: { id }, relations: ['variations', 'images'] });
  }

  async delete(id: string): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productsRepository.remove(product);
  }

  async getAiSuggestions(id: string): Promise<any> {
    const product = await this.productsRepository.findOne({ where: { id }, relations: ['department', 'vendorCategory'] });
    if (!product) throw new NotFoundException('Product not found');

    const context = product.aiContextType || product.vendorCategory?.nameEn?.toLowerCase() || product.department?.nameEn?.toLowerCase() || 'general';

    // Mock AI generation based on context
    if (context.includes('shoe') || context.includes('fashion') || context.includes('clothing')) {
      return {
        type: 'virtual_try_on',
        titleAr: 'جرب المنتج بالذكاء الاصطناعي',
        subtitleAr: 'شاهد كيف سيبدو المنتج عليك قبل الشراء',
        options: ['على القدم', 'على الجسم الكامل'],
        disclaimerAr: 'تعمل تقنية الذكاء الاصطناعي على محاكاة دقيقة للمنتج'
      };
    } else if (context.includes('tech') || context.includes('electronic') || context.includes('mobile') || context.includes('laptop')) {
      return {
        type: 'technical_analysis',
        titleAr: 'تحليل الذكاء الاصطناعي التقني',
        suggestions: [
          { title: 'أفضل استخدام', desc: 'مثالي للاستخدام المكتبي وبرمجة التطبيقات بفضل الذاكرة العشوائية السريعة.' },
          { title: 'البدائل المقترحة', desc: 'يوجد موديل أعلى بزيادة 15% في السعر يوفر ضعف مساحة التخزين.' }
        ]
      };
    } else if (context.includes('beauty') || context.includes('cosmetic')) {
      return {
        type: 'beauty_routine',
        titleAr: 'روتين العناية بالذكاء الاصطناعي',
        routine: [
          'استخدميه مرة صباحاً ومرة مساءً.',
          'يُفضل استخدامه بعد تنظيف البشرة بالغسول المناسب.',
          'تجنبي التعرض المباشر للشمس بعد الاستخدام.'
        ]
      };
    } else if (context.includes('service')) {
      return {
        type: 'service_steps',
        titleAr: 'خطوات التنفيذ المتوقعة',
        steps: ['الاستشارة المبدئية', 'تخطيط المشروع', 'التنفيذ والمراجعة'],
        estimatedDuration: 'يومين إلى أسبوع'
      };
    }

    return {
      type: 'general',
      titleAr: 'رؤى إضافية',
      message: 'هذا المنتج حاصل على تقييمات ممتازة من العملاء الذين اشتروه مؤخراً.'
    };
  }

  async getRecommendations(id: string): Promise<Product[]> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const whereCondition: any = { 
      id: Not(product.id),
      status: ProductStatus.APPROVED,
    };

    if (product.departmentId) {
      whereCondition.departmentId = product.departmentId;
    }

    const recommendations = await this.productsRepository.find({
      where: whereCondition,
      relations: ['images', 'vendor', 'department'],
      take: 4,
      order: { reviewCount: 'DESC' }
    });

    // If not enough recommendations, fallback to any approved products
    if (recommendations.length < 4) {
      const more = await this.productsRepository.find({
        where: { id: Not(product.id), status: ProductStatus.APPROVED },
        relations: ['images', 'vendor', 'department'],
        take: 4 - recommendations.length,
        order: { rating: 'DESC' }
      });
      return [...recommendations, ...more];
    }

    return recommendations;
  }
}
