// src/app/lib/utils.ts
export function cn(...classNames: (string | undefined | false | null)[]): string {
    return classNames.filter(Boolean).join(' ');
  }
  