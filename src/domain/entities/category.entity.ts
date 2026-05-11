export type CategoryType = "SERVICE" | "PRODUCT";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  imageUrl: string;
}
