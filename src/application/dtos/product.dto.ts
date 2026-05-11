import type { ProductCategorySlug } from "@/domain/entities/product.entity";

export type ProductListQueryDto = {
  categorySlug?: ProductCategorySlug;
  query?: string;
};
