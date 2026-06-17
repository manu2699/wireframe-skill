// shadcn class-name helper: merge conditional classes and dedupe Tailwind
// utilities (last-wins) so component variants compose cleanly.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
