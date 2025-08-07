import React, { ButtonHTMLAttributes, ReactNode } from "react";
import cn from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({ variant = "solid", size = "md", children, className, disabled, ...props }: ButtonProps) {
  const base = "font-semibold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300";

  const variants = {
    solid: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white",
    outline: "border border-gray-600 hover:border-indigo-600 hover:text-indigo-600 focus:ring-indigo-500 text-white",
    destructive: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
