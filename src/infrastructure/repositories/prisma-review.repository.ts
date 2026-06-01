import { PrismaClient } from "@prisma/client";
import type { ReviewRepository } from "@/domain/repositories/review.repository";
import type { Review } from "@/domain/entities/review.entity";

const prisma = new PrismaClient();

export class PrismaReviewRepository implements ReviewRepository {
  async create(review: Omit<Review, "id" | "createdAt" | "updatedAt">): Promise<Review> {
    const created = await prisma.review.create({
      data: {
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl,
        isFeatured: review.isFeatured,
        userId: review.userId,
        serviceId: review.serviceId,
        productId: review.productId,
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    });

    return created as Review;
  }

  async update(id: string, review: Partial<Review>): Promise<Review> {
    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl,
        isFeatured: review.isFeatured,
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    });
    return updated as Review;
  }

  async delete(id: string): Promise<void> {
    await prisma.review.delete({ where: { id } });
  }

  async findById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    });
    return review as Review | null;
  }

  async findFeatured(): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: { isFeatured: true },
      include: {
        user: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return reviews as Review[];
  }

  async findByUserId(userId: string): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    return reviews as Review[];
  }
}
