import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border/75 bg-card text-card-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.05),0_10px_24px_-14px_hsl(var(--foreground)/0.22),0_26px_50px_-28px_hsl(var(--foreground)/0.26)] transition-[box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_6px_18px_hsl(var(--foreground)/0.08),0_24px_50px_-20px_hsl(var(--foreground)/0.34)] [&>[data-slot=card-header]]:border-b [&>[data-slot=card-header]]:border-border/70 [&>[data-slot=card-content]+[data-slot=card-content]]:border-t [&>[data-slot=card-content]+[data-slot=card-content]]:border-border/60 [&>[data-slot=card-footer]]:border-t [&>[data-slot=card-footer]]:border-border/70",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    data-slot="card-header"
    ref={ref}
    className={cn("flex flex-col space-y-2 p-8 pb-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div data-slot="card-content" ref={ref} className={cn("p-8 pt-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    data-slot="card-footer"
    ref={ref}
    className={cn("flex items-center p-8 pt-6", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
