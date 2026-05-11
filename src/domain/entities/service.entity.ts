export type ServiceCategorySlug =
  | "unas-acrilicas"
  | "manicure"
  | "pedicure"
  | "nail-art"
  | "spa-de-unas"
  | "depilacion-laser";

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
