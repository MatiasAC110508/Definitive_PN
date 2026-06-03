"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import type {
  Product,
  ProductCategorySlug,
} from "@/domain/entities/product.entity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  Star,
  Tag,
  DollarSign,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import { compressImage } from "@/lib/compress-image";

const productCategorySlugs: ProductCategorySlug[] = [
  "esmaltes",
  "tratamientos",
  "herramientas",
  "kits",
  "spa",
];

const productCategoryLabels: Partial<Record<ProductCategorySlug, string>> = {
  esmaltes: "Esmaltes",
  tratamientos: "Tratamientos",
  herramientas: "Herramientas",
  kits: "Kits de Belleza",
  spa: "Productos de Spa",
};

interface AdminProductsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export function AdminProductsTab({
  products,
  setProducts,
}: AdminProductsTabProps) {
  const [productQuery, setProductQuery] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productFormData, setProductFormData] = useState<{
    name: string;
    categorySlug: ProductCategorySlug | "";
    description: string;
    price: number | "";
    stock: number | "";
    imageUrl: string;
    isFeatured: boolean;
  }>({
    name: "",
    categorySlug: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    isFeatured: false,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.categorySlug.includes(q);
    });
  }, [products, productQuery]);

  function openCreateProductModal() {
    setEditingProduct(null);
    setProductFormData({
      name: "",
      categorySlug: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      isFeatured: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsProductModalOpen(true);
  }

  function openEditProductModal(product: Product) {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      categorySlug: product.categorySlug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isFeatured: product.isFeatured,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsProductModalOpen(true);
  }

  function handleFileSelect(file: File | null) {
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato no válido. Solo JPG, PNG, WebP, AVIF o GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 5 MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearImageFile() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !productFormData.name ||
      !productFormData.categorySlug ||
      productFormData.price === "" ||
      productFormData.stock === ""
    ) {
      toast.error("Faltan campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = productFormData.imageUrl;

      // Compress and convert to base64 if a new file was selected
      if (imageFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await compressImage(imageFile);
        } catch {
          toast.error("Error al procesar la imagen.");
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // For new products, image is required
      if (!editingProduct && !finalImageUrl) {
        toast.error("Debes seleccionar una imagen para el producto.");
        setIsSubmitting(false);
        return;
      }

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const payload = {
        ...productFormData,
        slug:
          editingProduct && editingProduct.name === productFormData.name
            ? editingProduct.slug
            : generateSlug(productFormData.name),
        categorySlug: productFormData.categorySlug,
        price: Number(productFormData.price),
        stock: Number(productFormData.stock),
        imageUrl: finalImageUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (editingProduct) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProduct.id ? data.data.product : p,
            ),
          );
          toast.success("Producto actualizado correctamente.");
        } else {
          setProducts((prev) => [data.data.product, ...prev]);
          toast.success("Producto creado correctamente.");
        }
        setIsProductModalOpen(false);
        setImageFile(null);
        setImagePreview(null);
      } else {
        toast.error(data.error?.message || "Error al procesar la solicitud.");
      }
    } catch {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  async function deleteProduct() {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
        toast.success("Producto eliminado correctamente.");
      } else {
        toast.error(data.error?.message || "No se pudo eliminar el producto.");
      }
    } catch {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  }

  return (
    <>
      <Card className="border-[var(--line)] overflow-hidden">
        <CardHeader className="bg-[var(--quartz-soft)]/30 border-b border-[var(--line)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl">
                Catálogo de Productos
              </CardTitle>
              <CardDescription>
                Visualiza y administra los productos que ofreces.
              </CardDescription>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                <Input
                  placeholder="Buscar por nombre o categoría..."
                  className="pl-9 bg-white border-[var(--gold)]/40 rounded-xl"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />
              </div>
              <Button variant="gold" onClick={openCreateProductModal}>
                <Plus className="mr-2 size-4" /> Nuevo Producto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--quartz-soft)]/50 text-[var(--ink-soft)] uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4 text-center">Inventario</th>
                  <th className="px-6 py-4 text-center">Visibilidad</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[var(--line)] bg-white">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="40px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--ink)]">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-[var(--ink-soft)] truncate max-w-[150px]">
                            {product.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="default"
                        className="bg-[var(--quartz-soft)] border-none text-[var(--ink)]"
                      >
                        <Tag className="mr-1 size-3 text-[var(--ink-soft)]" />
                        {productCategoryLabels[product.categorySlug]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--ink)]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {product.stock <= 5 ? (
                          <span className="flex size-2 rounded-full bg-rose-500 relative">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                          </span>
                        ) : (
                          <span className="size-2 rounded-full bg-emerald-500 shadow-sm" />
                        )}
                        <span className="font-medium text-[var(--ink)]">
                          {product.stock} un.
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.isFeatured ? (
                        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-none">
                          <Star className="mr-1 size-3 fill-amber-600" />{" "}
                          Destacado
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="text-[var(--ink-soft)] bg-transparent border border-[var(--line)]"
                        >
                          Estándar
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:text-[var(--gold)]"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => openEditProductModal(product)}
                          >
                            <Edit className="mr-2 size-4" /> Editar Producto
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-700"
                            onClick={() => setProductToDelete(product.id)}
                          >
                            <Trash2 className="mr-2 size-4" /> Eliminar Producto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-[var(--quartz-soft)] p-4 mb-4">
                  <Package className="size-8 text-[var(--ink-soft)] opacity-40" />
                </div>
                <h3 className="font-display text-lg font-bold">
                  No se encontraron productos
                </h3>
                <p className="text-sm text-[var(--ink-soft)] max-w-sm mt-2">
                  Todavía no has agregado ningún producto a tu catálogo o la
                  búsqueda no produjo resultados.
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 border border-[var(--line)] hover:bg-[var(--quartz-soft)]"
                  onClick={openCreateProductModal}
                >
                  Agregar el primer producto
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-[700px] overflow-hidden p-0 glass-panel">
          <div className="bg-[linear-gradient(135deg,var(--ink)_0%,#241f26_58%,#3a3037_100%)] p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-[var(--gold)] flex items-center justify-center">
                  <Package className="size-6 text-[var(--ink)]" />
                </div>
                <div>
                  <DialogTitle className="font-display text-3xl text-white">
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </DialogTitle>
                  <DialogDescription className="text-white/75">
                    Añade o modifica los artículos de tu catálogo.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleProductSubmit}
            className="p-8 space-y-6 bg-transparent max-h-[70vh] overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Nombre del Producto
                </Label>
                <Input
                  value={productFormData.name}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      name: e.target.value,
                    })
                  }
                  required
                  placeholder="Ej. Kit de Uñas Acrílicas"
                  className="h-12 border-[var(--line)] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Categoría
                </Label>
                <Select
                  value={productFormData.categorySlug}
                  onValueChange={(val) =>
                    setProductFormData({
                      ...productFormData,
                      categorySlug: val as ProductCategorySlug,
                    })
                  }
                >
                  <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategorySlugs.map((slug) => (
                      <SelectItem key={slug} value={slug}>
                        {productCategoryLabels[slug]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Precio (COP)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                  <Input
                    type="number"
                    min="0"
                    value={productFormData.price}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        price:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    required
                    className="h-12 pl-10 border-[var(--line)] rounded-xl [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: "textfield" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Stock Disponible
                </Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                  <Input
                    type="number"
                    min="0"
                    value={productFormData.stock}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        stock:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    required
                    className="h-12 pl-10 border-[var(--line)] rounded-xl [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: "textfield" }}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Imagen del Producto
                </Label>

                {/* Preview */}
                {(imagePreview || productFormData.imageUrl) && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--quartz-soft)]">
                    <Image
                      src={imagePreview || productFormData.imageUrl}
                      alt="Vista previa"
                      fill
                      sizes="600px"
                      unoptimized
                      className="object-cover"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={clearImageFile}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* File input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-[var(--gold)]/40 bg-[var(--gold)]/5 hover:bg-[var(--gold)]/10 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-all cursor-pointer"
                >
                  <Upload className="size-4" />
                  {imageFile
                    ? imageFile.name
                    : editingProduct
                      ? "Cambiar imagen (opcional)"
                      : "Seleccionar imagen"}
                </button>
                {isUploading && (
                  <p className="text-xs text-[var(--gold)] animate-pulse">
                    Subiendo imagen...
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Descripción
                </Label>
                <textarea
                  className="w-full h-24 p-4 rounded-xl border border-[var(--line)] bg-white text-sm focus:ring-2 focus:ring-[var(--gold)] outline-none transition-all resize-none"
                  placeholder="Describe los beneficios y características del producto..."
                  value={productFormData.description}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex items-center space-x-2 md:col-span-2 bg-white/80 p-4 rounded-xl border border-[var(--line)] shadow-sm">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={productFormData.isFeatured}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[var(--gold)] border-[var(--line)] rounded focus:ring-[var(--gold)]"
                />
                <Label
                  htmlFor="isFeatured"
                  className="text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Star className="size-4 text-[var(--gold)]" /> Producto
                  Destacado
                </Label>
              </div>
            </div>

            <DialogFooter className="border-t border-[var(--line)] pt-6 pb-8 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsProductModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="gold"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[var(--gold-soft)]/20"
              >
                {isSubmitting
                  ? "Procesando..."
                  : editingProduct
                    ? "Guardar Cambios"
                    : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto desaparecerá
              permanentemente del catálogo y la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void deleteProduct();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar Definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
