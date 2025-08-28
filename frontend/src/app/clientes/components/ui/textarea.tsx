import * as React from "react";
import { cn } from "@/app/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex w-full rounded-md border border-input bg-[#1e293b] px-3 py-2 text-sm leading-relaxed text-white shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };