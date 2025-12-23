 "use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "#020617",
          color: "#e2e8f0",
          border: "1px solid #1e293b"
        }
      }}
    />
  );
}


