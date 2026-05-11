import { ProductCatalogClient } from "@/modules/products/presentation/product-catalog-client";
import { productCategories } from "@/infrastructure/mock/perfect-nails-data";
import { getProductRepository } from "@/infrastructure/repositories/repository-factory";

export async function ProductCatalogPage() {
  const products = await getProductRepository().findAll();

  return <ProductCatalogClient categories={productCategories} products={products} />;
}
