import { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { apiError, ok, validationError } from "@/presentation/http/api-response";
import { getReviewRepository } from "@/infrastructure/repositories/repository-factory";
import { CreateReviewUseCase } from "@/application/use-cases/reviews/create-review.use-case";
import { reviewSchema } from "@/application/validations/review.schema";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return apiError("Debes iniciar sesión para dejar una reseña.", 401);
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const useCase = new CreateReviewUseCase(getReviewRepository());
    const newReview = await useCase.execute({
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      serviceId: parsed.data.serviceId,
      productId: parsed.data.productId,
    });

    return ok({ review: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    return apiError("No se pudo publicar la reseña.", 500);
  }
}
