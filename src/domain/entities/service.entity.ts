export type ServiceCategorySlug =
  | "unas-acrilicas"
  | "manicure"
  | "pedicure"
  | "nail-art"
  | "spa-de-unas"
  | "depilacion-laser"
  | "unas-premium"
  | "masajes";

export interface BeautyService {
  id: string;
  name: string;
  slug: string;
  categorySlug: ServiceCategorySlug;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  isFeatured: boolean;
}
