"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "18px",
          border: "1px solid rgba(198, 161, 91, 0.28)",
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          color: "var(--ink)",
        },
      }}
    />
  );
}
