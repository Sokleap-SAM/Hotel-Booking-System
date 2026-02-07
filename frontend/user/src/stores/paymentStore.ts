import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const api = axios.create({ baseURL: 'http://localhost:3000' })

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

export type PaymentMethod = 'khqr' | 'card'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface KhqrPaymentResponse {
  paymentId: string
  qrReference: string
  qrCodeData: string
  amount: number
  expiresAt: string
  status: string
}

export interface CardPaymentResponse {
  paymentId: string
  transactionId: string
  amount: number
  cardLast4: string
  cardBrand: string
  status: string
}

export interface PaymentStatusResponse {
  paymentId: string
  bookingId: string
  amount: number
  paymentMethod: string
  status: PaymentStatus
  transactionId?: string
  completedAt?: string
  failureReason?: string
}

export interface CardDetails {
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  cardHolderName: string
}

export interface Payment {
  id: string
  bookingId: string
  userId: number
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  qrReference?: string
  cardLast4?: string
  cardBrand?: string
  transactionId?: string
  failureReason?: string
  createdAt: string
  completedAt?: string
}

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    // Current payment flow
    currentPayment: null as KhqrPaymentResponse | CardPaymentResponse | null,
    paymentStatus: null as PaymentStatusResponse | null,
    selectedMethod: 'card' as PaymentMethod,
    
    // KHQR specific
    khqrData: null as KhqrPaymentResponse | null,
    isPollingStatus: false,
    
    // User's payment history
    paymentHistory: [] as Payment[],
    
    // Loading states
    isProcessing: false,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    isPaymentCompleted: (state) => state.paymentStatus?.status === 'completed',
    isPaymentFailed: (state) => state.paymentStatus?.status === 'failed',
    isPaymentPending: (state) => state.paymentStatus?.status === 'pending',
  },

  actions: {
    setPaymentMethod(method: PaymentMethod) {
      this.selectedMethod = method
    },

    // Initialize KHQR payment
    async initializeKhqrPayment(bookingId: string): Promise<KhqrPaymentResponse | null> {
      this.isProcessing = true
      this.error = null

      try {
        const response = await api.post<KhqrPaymentResponse>('/payments/khqr', {
          bookingId,
        })
        this.khqrData = response.data
        this.currentPayment = response.data
        return response.data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to initialize KHQR payment'
        return null
      } finally {
        this.isProcessing = false
      }
    },

    // Process card payment
    async processCardPayment(
      bookingId: string,
      cardDetails: CardDetails
    ): Promise<CardPaymentResponse | null> {
      this.isProcessing = true
      this.error = null

      try {
        const response = await api.post<CardPaymentResponse>('/payments/card', {
          bookingId,
          cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
          cardExpiry: cardDetails.cardExpiry,
          cardCvv: cardDetails.cardCvv,
          cardHolderName: cardDetails.cardHolderName,
        })
        this.currentPayment = response.data
        
        // Set status based on response
        this.paymentStatus = {
          paymentId: response.data.paymentId,
          bookingId,
          amount: response.data.amount,
          paymentMethod: 'card',
          status: response.data.status as PaymentStatus,
          transactionId: response.data.transactionId,
        }
        
        return response.data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to process card payment'
        return null
      } finally {
        this.isProcessing = false
      }
    },

    // Confirm KHQR payment (simulate user confirming they've paid)
    async confirmKhqrPayment(paymentId: string): Promise<PaymentStatusResponse | null> {
      this.isProcessing = true
      this.error = null

      try {
        const response = await api.post<PaymentStatusResponse>(
          `/payments/${paymentId}/confirm-khqr`
        )
        this.paymentStatus = response.data
        return response.data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to confirm payment'
        return null
      } finally {
        this.isProcessing = false
      }
    },

    // Check payment status
    async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse | null> {
      try {
        const response = await api.get<PaymentStatusResponse>(
          `/payments/${paymentId}/status`
        )
        this.paymentStatus = response.data
        return response.data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to check payment status'
        return null
      }
    },

    // Get payment by booking
    async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
      try {
        const response = await api.get<Payment>(`/payments/booking/${bookingId}`)
        return response.data
      } catch {
        return null
      }
    },

    // Fetch user's payment history
    async fetchPaymentHistory() {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get<Payment[]>('/payments/my-payments')
        this.paymentHistory = response.data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to fetch payment history'
      } finally {
        this.isLoading = false
      }
    },

    // Cancel pending payment
    async cancelPayment(paymentId: string): Promise<boolean> {
      this.isProcessing = true
      this.error = null

      try {
        await api.patch(`/payments/${paymentId}/cancel`)
        return true
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to cancel payment'
        return false
      } finally {
        this.isProcessing = false
      }
    },

    // Request refund
    async requestRefund(paymentId: string): Promise<PaymentStatusResponse | null> {
      this.isProcessing = true
      this.error = null

      try {
        const response = await api.post<PaymentStatusResponse>(
          `/payments/${paymentId}/refund`
        )
        this.paymentStatus = response.data
        return response.data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to process refund'
        return null
      } finally {
        this.isProcessing = false
      }
    },

    // Start polling for KHQR payment status
    startPollingPaymentStatus(paymentId: string, interval = 3000) {
      this.isPollingStatus = true
      
      const pollInterval = setInterval(async () => {
        if (!this.isPollingStatus) {
          clearInterval(pollInterval)
          return
        }

        const status = await this.checkPaymentStatus(paymentId)
        if (status && (status.status === 'completed' || status.status === 'failed')) {
          this.stopPollingPaymentStatus()
          clearInterval(pollInterval)
        }
      }, interval)

      // Auto-stop after 15 minutes
      setTimeout(() => {
        this.stopPollingPaymentStatus()
        clearInterval(pollInterval)
      }, 15 * 60 * 1000)
    },

    stopPollingPaymentStatus() {
      this.isPollingStatus = false
    },

    // Clear payment state
    clearPaymentState() {
      this.currentPayment = null
      this.paymentStatus = null
      this.khqrData = null
      this.error = null
      this.isPollingStatus = false
    },
  },
})
