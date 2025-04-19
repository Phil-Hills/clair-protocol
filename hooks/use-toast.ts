"use client"

import { useState } from "react"

type ToastVariant = "default" | "destructive" | "success"

type Toast = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({
    title,
    description,
    variant = "default",
  }: {
    title: string
    description?: string
    variant?: ToastVariant
  }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, variant }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 3000)

    return id
  }

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return { toast, dismiss, toasts }
}
