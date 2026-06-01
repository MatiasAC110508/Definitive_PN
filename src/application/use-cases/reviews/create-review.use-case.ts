import type { ReviewRepository } from "@/domain/repositories/review.repository";

export class CreateReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(dto: {
    userId: string;
    rating: number;
    comment: string;
    serviceId?: string;
    productId?: string;
  }) {
    // Basic business logic: wait until payment to review? Or just let logged-in users review.
    // For now we just let verified clients review.
    const created = await this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      imageUrl: "", // We can add image uploads later
      isFeatured: false, // Moderated by admin later
      userId: dto.userId,
      serviceId: dto.serviceId || null,
      productId: dto.productId || null,
    });
    return created;
  }
}
