import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { FakeReviewsService } from '../ai/fake-reviews/fake-reviews.service';
import { ReviewSummarizerService } from '../ai/review-summarizer/review-summarizer.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private fakeReviewsService: FakeReviewsService,
    private reviewSummarizerService: ReviewSummarizerService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const product = await this.productRepository.findOne({ where: { id: createReviewDto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const review = this.reviewRepository.create({
      userId,
      productId: product.id,
      vendorId: product.vendorId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    if (createReviewDto.comment) {
      const fakeAnalysis = await this.fakeReviewsService.analyze(createReviewDto.comment, product.nameAr || product.nameEn);
      if (fakeAnalysis) {
        review.isFake = fakeAnalysis.isFake;
        review.fakeConfidence = fakeAnalysis.confidence;
        review.fakeReason = fakeAnalysis.reason;
        if (!fakeAnalysis.isFake) {
          review.isApproved = true;
        }
      } else {
        // If analysis fails, approve by default or leave for manual approval
        review.isApproved = true;
      }
    } else {
      review.isApproved = true; // Rating without comment is approved
    }

    const savedReview = await this.reviewRepository.save(review);
    
    if (savedReview.isApproved) {
      await this.updateProductRating(product.id);
    }

    return savedReview;
  }

  async findByProduct(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { productId, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    let summary = null;
    if (reviews.length >= 5) {
      const comments = reviews.map(r => r.comment).filter(c => !!c);
      if (comments.length >= 5) {
        summary = await this.reviewSummarizerService.summarize(comments);
      }
    }

    return { reviews, summary };
  }

  async updateProductRating(productId: string) {
    const reviews = await this.reviewRepository.find({ where: { productId, isApproved: true } });
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.productRepository.update(productId, {
      rating: Number(averageRating.toFixed(2)),
      reviewCount: reviews.length,
    });
  }

  async findAll() {
    return this.reviewRepository.find({ relations: ['user', 'product'], order: { createdAt: 'DESC' } });
  }

  async approve(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    review.isApproved = true;
    await this.reviewRepository.save(review);
    await this.updateProductRating(review.productId);
    
    return review;
  }

  async reject(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    review.isApproved = false;
    await this.reviewRepository.save(review);
    await this.updateProductRating(review.productId);
    
    return review;
  }
}
