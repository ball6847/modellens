import * as React from "react"
import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge-variants"
import type { BadgeVariantProps } from "@/components/ui/badge-variants"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & BadgeVariantProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
