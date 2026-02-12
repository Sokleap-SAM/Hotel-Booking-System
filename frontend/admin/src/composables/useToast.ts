import { ref, readonly } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = ++toastId
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    }
    toasts.value.push(newToast)

    // Auto-remove after duration if specified
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, message?: string) => {
    return addToast({ type: 'success', title, message })
  }

  const error = (title: string, message?: string) => {
    return addToast({ type: 'error', title, message, duration: 0 }) // Errors don't auto-dismiss
  }

  const warning = (title: string, message?: string) => {
    return addToast({ type: 'warning', title, message, duration: 0 }) // Warnings don't auto-dismiss
  }

  const info = (title: string, message?: string) => {
    return addToast({ type: 'info', title, message })
  }

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
