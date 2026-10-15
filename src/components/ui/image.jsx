import * as React from "react"
import { cn } from "@/lib/utils"

// Imagen simple. fittingType="fit" muestra la foto completa; "fill" la recorta para llenar el cuadro.
const Image = React.forwardRef(({ src, alt = "", fittingType = "fill", className, ...props }, ref) => (
  <img
    ref={ref}
    src={src}
    alt={alt}
    loading="lazy"
    className={cn(fittingType === "fit" ? "object-contain" : "object-cover", className)}
    {...props}
  />
))
Image.displayName = "Image"

export { Image }
