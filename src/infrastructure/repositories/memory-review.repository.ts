import type { ReviewRepository } from "@/domain/repositories/review.repository";
import type { Review } from "@/domain/entities/review.entity";

export class MemoryReviewRepository implements ReviewRepository {
  private reviews: Review[] = [];

  async create(review: Omit<Review, "id" | "createdAt" | "updatedAt">): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.push(newReview);
    return newReview;
  }

  async update(id: string, review: Partial<Review>): Promise<Review> {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Review not found");
    
    this.reviews[index] = { ...this.reviews[index], ...review, updatedAt: new Date() };
    return this.reviews[index];
  }

  async delete(id: string): Promise<void> {
    this.reviews = this.reviews.filter(r => r.id !== id);
  }

  async findById(id: string): Promise<Review | null> {
    return this.reviews.find(r => r.id === id) || null;
  }

  async findFeatured(): Promise<Review[]> {
    return this.reviews
      .filter(r => r.isFeatured)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6);
  }

  async findByUserId(userId: string): Promise<Review[]> {
    return this.reviews
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
