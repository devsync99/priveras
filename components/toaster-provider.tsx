// components/toaster-provider.tsx
"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "white",
        },
        className: "border border-gray-200",
      }}
    />
  );
}
