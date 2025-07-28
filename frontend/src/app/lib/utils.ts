// src/lib/utils.ts

/**
 * Função para concatenar classes CSS ignorando valores falsy.
 * Pode receber strings, booleanos, undefined ou null.
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
  }
  