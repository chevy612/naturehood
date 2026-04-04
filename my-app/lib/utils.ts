import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AIProvider } from "./services/ai-client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}