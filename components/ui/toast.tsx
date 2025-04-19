"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastProps = {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onDismiss: (id: string) => void
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(id), 300) // Wait for animation to complete
  }

  return (
    <div
      className={cn(
        "max-w-md w-full bg-slate-800 border shadow-lg rounded-lg pointer-events-auto flex items-start p-4 mb-2 transition-all duration-300 transform",
        variant === "destructive" && "border-red-600 bg-red-950/50",
        variant === "success" && "border-green-600 bg-green-950/50",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      <div className="flex-1 flex items-start">
        {variant === "destructive" && <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />}
        {variant === "success" && <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />}
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-4 flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }: { toasts: any[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
