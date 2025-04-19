import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add a global error handler to catch unhandled errors
export function setupErrorHandling() {
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      console.error("Uncaught error:", event.error)
      // You could also log this to a monitoring service
    })

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)
      // You could also log this to a monitoring service
    })
  }
}
