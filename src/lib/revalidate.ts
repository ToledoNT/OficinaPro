import { revalidatePath } from 'next/cache';

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Silently ignore if running outside Next.js request context (e.g. tests or scripts)
  }
}
