import type { Review } from "../entities/review.entity";

export interface ReviewRepository {
  create(review: Omit<Review, "id" | "createdAt" | "updatedAt">): Promise<Review>;
  update(id: string, review: Partial<Review>): Promise<Review>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Review | null>;
  findFeatured(): Promise<Review[]>;
  findByUserId(userId: string): Promise<Review[]>;
}
