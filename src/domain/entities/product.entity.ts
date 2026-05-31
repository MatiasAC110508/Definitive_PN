export type ProductCategorySlug = "ropa-femenina" | "cosmeticos" | "belleza" | "accesorios" | "esmaltes" | "tratamientos" | "herramientas" | "kits" | "spa";

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
