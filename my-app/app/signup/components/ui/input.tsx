import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "input-primary w-2/3 sm:flex-1 sm:w-auto min-w-0",
        className
      )}
      {...props}
    />
  )
}

export { Input }
