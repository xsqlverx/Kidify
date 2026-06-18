"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      toastOptions={{
        style: {
          background: "oklch(1 0.01 20 / 0.92)",
          backdropFilter: "blur(14px) saturate(140%)",
          border: "1px solid oklch(1 0.02 20 / 0.6)",
          borderRadius: "1.25rem",
          boxShadow: "0 1px 2px oklch(0.6 0.15 10 / 0.08), 0 8px 24px -8px oklch(0.6 0.18 10 / 0.18)",
          color: "oklch(0.34 0.05 20)",
          fontFamily: "var(--font-quicksand), system-ui, sans-serif",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
