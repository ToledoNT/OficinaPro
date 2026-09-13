/**
 * Utilitário para converter objetos do Prisma (incluindo instâncias de Decimal)
 * em objetos JavaScript planos (plain objects) compatíveis com Client Components do React 19 / Next.js.
 */
export function toPlain<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Date) return obj;

  // Se for instância de Prisma.Decimal (possui método toNumber)
  if (typeof obj === 'object' && typeof (obj as any).toNumber === 'function') {
    return (obj as any).toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toPlain(item)) as any;
  }

  if (typeof obj === 'object') {
    const plain: any = {};
    for (const key of Object.keys(obj)) {
      plain[key] = toPlain((obj as any)[key]);
    }
    return plain;
  }

  return obj;
}
