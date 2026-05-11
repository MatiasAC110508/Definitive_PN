export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { ProductCatalogPage } from "@/modules/products/presentation/product-catalog-page";

export const metadata: Metadata = {
  title: "Catálogo boutique",
  description:
    "Compra ropa femenina, cosméticos y productos de belleza en una experiencia boutique premium.",
};

export default function CatalogPage() {
  return <ProductCatalogPage />;
}
