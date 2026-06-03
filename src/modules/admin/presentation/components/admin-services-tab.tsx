"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import type {
  BeautyService,
  ServiceCategorySlug,
} from "@/domain/entities/service.entity";
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
  Sparkles,
  Star,
  Tag,
  DollarSign,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/formatters";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import { compressImage } from "@/lib/compress-image";

const serviceCategorySlugs: ServiceCategorySlug[] = [
  "unas-premium",
  "masajes",
  "facial-laser",
  "corporal-aparatologia",
  "depilacion-cera",
  "depilacion-laser",
  "hollywood-peeling",
  "unas-acrilicas",
  "manicure",
  "pedicure",
  "nail-art",
  "spa-de-unas",
];

const serviceCategoryLabels: Record<string, string> = {
  "unas-premium": "Cuidado de Uñas",
  masajes: "Masajes y Relajación",
  "facial-laser": "Facial y Láser",
  "corporal-aparatologia": "Corporal y Aparatología",
  "depilacion-cera": "Depilación con Cera",
  "depilacion-laser": "Depilación Láser",
  "hollywood-peeling": "Hollywood Peeling",
  "unas-acrilicas": "Uñas Acrílicas",
  manicure: "Manicure",
  pedicure: "Pedicure",
  "nail-art": "Nail Art",
  "spa-de-unas": "Spa de Uñas",
};

interface AdminServicesTabProps {
  services: BeautyService[];
  setServices: React.Dispatch<React.SetStateAction<BeautyService[]>>;
}

export function AdminServicesTab({
  services,
  setServices,
}: AdminServicesTabProps) {
  const [serviceQuery, setServiceQuery] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BeautyService | null>(
    null,
  );
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [serviceFormData, setServiceFormData] = useState<{
    name: string;
    slug: string;
    categorySlug: ServiceCategorySlug;
    description: string;
    price: number | "";
    durationMinutes: number | "";
    imageUrl: string;
    isFeatured: boolean;
  }>({
    name: "",
    slug: "",
    categorySlug: "depilacion-laser",
    description: "",
    price: "",
    durationMinutes: "",
    imageUrl: "",
    isFeatured: false,
  });

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const q = serviceQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.categorySlug.includes(q);
    });
  }, [services, serviceQuery]);

  function openCreateServiceModal() {
    setEditingService(null);
    setServiceFormData({
      name: "",
      slug: "",
      categorySlug: "depilacion-laser",
      description: "",
      price: "",
      durationMinutes: "",
      imageUrl: "",
      isFeatured: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsServiceModalOpen(true);
  }

  function openEditServiceModal(service: BeautyService) {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      slug: service.slug,
      categorySlug: service.categorySlug,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      imageUrl: service.imageUrl,
      isFeatured: service.isFeatured,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsServiceModalOpen(true);
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

  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = serviceFormData.imageUrl;

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

      // For new services, image is required
      if (!editingService && !finalImageUrl) {
        toast.error("Debes seleccionar una imagen para el servicio.");
        setIsSubmitting(false);
        return;
      }

      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services";
      const method = editingService ? "PATCH" : "POST";

      const payload = {
        ...serviceFormData,
        slug: serviceFormData.slug || generateSlug(serviceFormData.name),
        price: Number(serviceFormData.price),
        durationMinutes: Number(serviceFormData.durationMinutes),
        imageUrl: finalImageUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        const newService = data.data.service;
        if (editingService) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? newService : s)),
          );
          toast.success("Servicio actualizado correctamente.");
        } else {
          setServices((prev) => [newService, ...prev]);
          toast.success("Servicio creado con éxito.");
        }
        setIsServiceModalOpen(false);
        setImageFile(null);
        setImagePreview(null);
      } else {
        toast.error(data.error?.message || "Error al procesar el servicio.");
      }
    } catch {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  async function deleteService() {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${serviceToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== serviceToDelete));
        toast.success("Servicio eliminado correctamente.");
      } else {
        toast.error(data.error?.message || "No se pudo eliminar el servicio.");
      }
    } catch {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null);
    }
  }

  return (
    <>
      <Card className="border-[var(--line)] overflow-hidden">
        <CardHeader className="bg-[var(--quartz-soft)]/30 border-b border-[var(--line)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl">
                Catálogo de Servicios
              </CardTitle>
              <CardDescription>
                Visualiza y administra los servicios que ofreces.
              </CardDescription>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                <Input
                  placeholder="Buscar por nombre o categoría..."
                  className="pl-9 bg-white border-[var(--gold)]/40 rounded-xl"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                />
              </div>
              <Button variant="gold" onClick={openCreateServiceModal}>
                <Plus className="mr-2 size-4" /> Nuevo Servicio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--quartz-soft)]/50 text-[var(--ink-soft)] uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4 text-center">Duración</th>
                  <th className="px-6 py-4 text-center">Visibilidad</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-white transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[var(--line)] bg-white">
                          <Image
                            src={service.imageUrl}
                            alt={service.name}
                            fill
                            sizes="40px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--ink)]">
                            {service.name}
                          </span>
                          <span className="text-[10px] text-[var(--ink-soft)] truncate max-w-[150px]">
                            {service.slug}
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
                        {serviceCategoryLabels[service.categorySlug] ||
                          service.categorySlug}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--ink)]">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium">
                        {service.durationMinutes} min
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {service.isFeatured ? (
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
                            onClick={() => openEditServiceModal(service)}
                          >
                            <Edit className="mr-2 size-4" /> Editar Servicio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-700"
                            onClick={() => setServiceToDelete(service.id)}
                          >
                            <Trash2 className="mr-2 size-4" /> Eliminar Servicio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredServices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-[var(--quartz-soft)] p-4 mb-4">
                  <Sparkles className="size-8 text-[var(--ink-soft)] opacity-40" />
                </div>
                <h3 className="font-display text-lg font-bold">
                  No se encontraron servicios
                </h3>
                <p className="text-sm text-[var(--ink-soft)] max-w-sm mt-2">
                  Todavía no has agregado ningún servicio o la búsqueda no
                  produjo resultados.
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 border border-[var(--line)] hover:bg-[var(--quartz-soft)]"
                  onClick={openCreateServiceModal}
                >
                  Agregar el primer servicio
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-[700px] overflow-hidden p-0 glass-panel">
          <div className="bg-[linear-gradient(135deg,var(--ink)_0%,#241f26_58%,#3a3037_100%)] p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-[var(--gold)] flex items-center justify-center">
                  <Sparkles className="size-6 text-[var(--ink)]" />
                </div>
                <div>
                  <DialogTitle className="font-display text-3xl text-white">
                    {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                  </DialogTitle>
                  <DialogDescription className="text-white/75">
                    Añade o modifica los servicios ofrecidos.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleServiceSubmit}
            className="p-8 space-y-6 bg-transparent max-h-[70vh] overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Nombre del Servicio
                </Label>
                <Input
                  value={serviceFormData.name}
                  onChange={(e) =>
                    setServiceFormData({
                      ...serviceFormData,
                      name: e.target.value,
                    })
                  }
                  required
                  placeholder="Ej. Uñas Acrílicas Tradicionales"
                  className="h-12 border-[var(--line)] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">
                  Categoría
                </Label>
                <Select
                  value={serviceFormData.categorySlug}
                  onValueChange={(val) =>
                    setServiceFormData({
                      ...serviceFormData,
                      categorySlug: val as ServiceCategorySlug,
                    })
                  }
                >
                  <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategorySlugs.map((slug) => (
                      <SelectItem key={slug} value={slug}>
                        {serviceCategoryLabels[slug]}
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
                    value={serviceFormData.price}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
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
                  Duración Estimada (Minutos)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--ink-soft)]">
                    MIN
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="15"
                    value={serviceFormData.durationMinutes}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        durationMinutes:
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
                  Imagen del Servicio
                </Label>

                {/* Preview */}
                {(imagePreview || serviceFormData.imageUrl) && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--quartz-soft)]">
                    <Image
                      src={imagePreview || serviceFormData.imageUrl}
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
                    : editingService
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
                  placeholder="Describe el servicio, tecnología utilizada y beneficios..."
                  value={serviceFormData.description}
                  onChange={(e) =>
                    setServiceFormData({
                      ...serviceFormData,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex items-center space-x-2 md:col-span-2 bg-white/80 p-4 rounded-xl border border-[var(--line)] shadow-sm">
                <input
                  type="checkbox"
                  id="svcIsFeatured"
                  checked={serviceFormData.isFeatured}
                  onChange={(e) =>
                    setServiceFormData({
                      ...serviceFormData,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[var(--gold)] border-[var(--line)] rounded focus:ring-[var(--gold)]"
                />
                <Label
                  htmlFor="svcIsFeatured"
                  className="text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Star className="size-4 text-[var(--gold)]" /> Servicio
                  Destacado
                </Label>
              </div>
            </div>

            <DialogFooter className="border-t border-[var(--line)] pt-6 pb-8 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsServiceModalOpen(false)}
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
                  : editingService
                    ? "Guardar Cambios"
                    : "Crear Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!serviceToDelete}
        onOpenChange={(open) => !open && setServiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las citas previas se
              conservarán, pero el servicio ya no estará disponible para nuevas
              reservas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void deleteService();
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
