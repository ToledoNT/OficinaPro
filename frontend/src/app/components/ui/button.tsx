// components/ui/button.tsx
import { cn } from "@/app/lib/utils"
import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline"; 
  }
  
  const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", ...props }, ref) => {
      return (
        <button
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            variant === "default" && "bg-primary text-white hover:bg-primary/90",
            variant === "outline" && "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
            className
          )}
          {...props}
        />
      );
    }
  );
  Button.displayName = "Button";
  
  export { Button };