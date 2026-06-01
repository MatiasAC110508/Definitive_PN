import type { ReviewRepository } from "@/domain/repositories/review.repository";

export class GetFeaturedReviewsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute() {
    return this.reviewRepository.findFeatured();
  }
}
