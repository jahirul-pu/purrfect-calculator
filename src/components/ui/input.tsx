import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, min, onKeyDown, onPaste, onChange, ...props }, ref) => {
    const resolvedValue =
      type === "number" && typeof value === "number" && value <= 0 ? "" : value

    return (
      <input
        type={type}
        value={resolvedValue}
        min={type === "number" ? (min ?? 0) : min}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onKeyDown={(event) => {
          if (type === "number" && ["e", "E", "+", "-"].includes(event.key)) {
            event.preventDefault()
          }
          onKeyDown?.(event)
        }}
        onPaste={(event) => {
          if (type === "number") {
            const pasted = event.clipboardData.getData("text")
            if (!/^\d*\.?\d*$/.test(pasted)) {
              event.preventDefault()
            }
          }
          onPaste?.(event)
        }}
        onChange={(event) => {
          if (type === "number") {
            const next = event.target.value
            if (next !== "" && !/^\d*\.?\d*$/.test(next)) {
              return
            }
          }
          onChange?.(event)
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
