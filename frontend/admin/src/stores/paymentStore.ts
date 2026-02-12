import { defineStore } from 'pinia'
import api from '@/utils/api'

export interface Payment {
  id: string
  bookingId: string
  userId: number
  amount: number
  paymentMethod: 'khqr' | 'stripe'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  transactionId: string | null
  qrReference: string | null
  cardLast4: string | null
  cardBrand: string | null
  failureReason: string | null
  stripePaymentIntentId: string | null
  createdAt: string
  completedAt: string | null
  booking?: {
    id: string
    totalPrice: number
    status: string
    checkIn?: string
    checkOut?: string
    bookingItems?: Array<{
      id: string
      room: {
        id: string
        name: string
      }
    }>
  }
  user?: {
    id: number
    email: string
    firstName?: string
    lastName?: string
  }
}

interface PaymentState {
  payments: Payment[]
  selectedPayment: Payment | null
  isLoading: boolean
  error: string | null
  statusFilter: 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  methodFilter: 'all' | 'khqr' | 'stripe'
  searchQuery: string
}

export const usePaymentStore = defineStore('payment', {
  state: (): PaymentState => ({
    payments: [],
    selectedPayment: null,
    isLoading: false,
    error: null,
    statusFilter: 'all',
    methodFilter: 'all',
    searchQuery: '',
  }),

  getters: {
    filteredPayments: (state) => {
      let result = state.payments

      // Filter by status
      if (state.statusFilter !== 'all') {
        result = result.filter((p) => p.status === state.statusFilter)
      }

      // Filter by payment method
      if (state.methodFilter !== 'all') {
        result = result.filter((p) => p.paymentMethod === state.methodFilter)
      }

      // Filter by search query (transaction ID or booking ID)
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        result = result.filter(
          (p) =>
            p.id.toLowerCase().includes(query) ||
            p.bookingId.toLowerCase().includes(query) ||
            (p.transactionId && p.transactionId.toLowerCase().includes(query)) ||
            (p.user?.email && p.user.email.toLowerCase().includes(query))
        )
      }

      return result
    },

    totalCount: (state) => state.payments.length,
    
    completedCount: (state) => state.payments.filter((p) => p.status === 'completed').length,
    
    pendingCount: (state) => state.payments.filter((p) => p.status === 'pending').length,
    
    failedCount: (state) => state.payments.filter((p) => p.status === 'failed').length,

    khqrCount: (state) => state.payments.filter((p) => p.paymentMethod === 'khqr').length,
    
    stripeCount: (state) => state.payments.filter((p) => p.paymentMethod === 'stripe').length,

    totalRevenue: (state) => 
      state.payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0),
  },

  actions: {
    setStatusFilter(status: PaymentState['statusFilter']) {
      this.statusFilter = status
    },

    setMethodFilter(method: PaymentState['methodFilter']) {
      this.methodFilter = method
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    async fetchAllPayments() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get<Payment[]>('/payments/admin/all')
        this.payments = data
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Failed to fetch payments'
        console.error('Failed to fetch payments:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchPaymentDetails(paymentId: string) {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get<Payment>(`/payments/admin/${paymentId}/details`)
        this.selectedPayment = data
        return data
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Failed to fetch payment details'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    clearSelectedPayment() {
      this.selectedPayment = null
    },
  },
})
