import * as React from "react";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-lg border p-4 shadow-sm ${className ?? ""}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 ${className ?? ""}`} {...props} />
    );
  }
);
CardContent.displayName = "CardContent";