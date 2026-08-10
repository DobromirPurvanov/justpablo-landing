import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Стандартният shadcn помощник: слепва класове и разрешава конфликтите
    в полза на последния (`px-4` подадено отвън бие `px-2` по подразбиране). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
