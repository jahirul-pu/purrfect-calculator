import * as React from "react"

import { cn } from "@/lib/utils"

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed = false, onPressedChange, onClick, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={pressed}
        data-state={pressed ? "on" : "off"}
        className={cn(
          "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-[background-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:shadow-[0_0_0_4px_hsl(var(--primary)/0.18)] data-[state=off]:bg-input",
          className
        )}
        ref={ref}
        onClick={(event) => {
          onPressedChange?.(!pressed)
          onClick?.(event)
        }}
        {...props}
      >
        <span
          data-state={pressed ? "on" : "off"}
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-out data-[state=on]:translate-x-4 data-[state=off]:translate-x-0"
          )}
        />
      </button>
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }
