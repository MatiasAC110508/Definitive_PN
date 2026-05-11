export type ProductCategorySlug = "ropa-femenina" | "cosmeticos" | "belleza" | "accesorios";

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: ProductCategorySlug;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  isFeatured: boolean;
}
