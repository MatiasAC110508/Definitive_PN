"use client";

import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LeaveReviewModal() {
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Perfect%20Nails%20VM%2C%20Cl.%2031%20%2355-13%2C%20La%20Florida%2C%20Bello%2C%20Antioquia";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center mt-12 mb-8">
          <Button variant="luxury" size="lg" className="px-8 shadow-sm">
            Dejar una Reseña
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center">
            Cuéntanos tu experiencia
          </DialogTitle>
          <DialogDescription className="text-center">
            Para mantener nuestros precios bajos y la máxima seguridad,
            gestionamos nuestras reseñas directamente en Google.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <div className="flex gap-2 text-[var(--gold)]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="size-10 fill-current" />
            ))}
          </div>

          <p className="text-[var(--ink)] font-medium">
            ¡Tu opinión nos ayuda a que más mujeres descubran nuestro salón!
          </p>

          <Button
            asChild
            variant="gold"
            size="lg"
            className="w-full sm:w-auto mt-4 px-8 gap-2 border border-white/20"
          >
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="size-4" />
              Calificarnos en Google Maps
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
