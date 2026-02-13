import { defineStore } from 'pinia'
import api from '../utils/api'

export type PaymentMethod = 'stripe'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface StripeCheckoutResponse {
  paymentId: string
  checkoutUrl: string
  sessionId: string
  amount: number
  currency: string
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
    currentPayment: null as StripeCheckoutResponse | null,
    paymentStatus: null as PaymentStatusResponse | null,
    selectedMethod: 'stripe' as PaymentMethod,
    
    // Stripe specific
    stripeCheckoutData: null as StripeCheckoutResponse | null,
    
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

    // Create Stripe Checkout session - redirects to Stripe hosted page
    async createStripeCheckout(bookingId: string): Promise<StripeCheckoutResponse | null> {
      this.isProcessing = true
      this.error = null

      try {
        const response = await api.post<StripeCheckoutResponse>('/payments/stripe/checkout', {
          bookingId,
        })
        this.stripeCheckoutData = response.data
        this.currentPayment = response.data
        return response.data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        this.error = error.response?.data?.message || 'Failed to create Stripe checkout'
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

    // Clear payment state
    clearPaymentState() {
      this.currentPayment = null
      this.paymentStatus = null
      this.stripeCheckoutData = null
      this.error = null
      this.isPollingStatus = false
    },
  },
})
