/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import api from '@/utils/api'

export interface Role {
  id: number
  name: string
}

export interface UserRole {
  id: number
  role: Role
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  provider: 'local' | 'google'
  profileImage: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  roles: UserRole[]
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: { role: string; count: number }[]
}

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  password: string
  roleIds: number[]
  isActive?: boolean
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  password?: string
  isActive?: boolean
}

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    roles: [] as Role[],
    stats: null as UserStats | null,
    isLoading: false,
    searchQuery: '',
    roleFilter: 'all' as string,
    statusFilter: 'all' as 'all' | 'active' | 'inactive',
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  }),

  getters: {
    filteredUsers: (state) => {
      let result = state.users

      // Filter by search query (client-side additional filtering)
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        result = result.filter(
          (user) =>
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query),
        )
      }

      return result
    },

    totalCount: (state) => state.pagination.total,

    activeCount: (state) => state.stats?.activeUsers ?? 0,

    inactiveCount: (state) => state.stats?.inactiveUsers ?? 0,

    getUserRoleNames: () => (user: User) => {
      return user.roles?.map((ur) => ur.role?.name).filter(Boolean) ?? []
    },
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    setRoleFilter(role: string) {
      this.roleFilter = role
      this.pagination.page = 1
      this.fetchUsers()
    },

    setStatusFilter(status: 'all' | 'active' | 'inactive') {
      this.statusFilter = status
      this.pagination.page = 1
      this.fetchUsers()
    },

    setPage(page: number) {
      this.pagination.page = page
      this.fetchUsers()
    },

    async fetchUsers() {
      this.isLoading = true
      try {
        const params: Record<string, any> = {
          page: this.pagination.page,
          limit: this.pagination.limit,
        }

        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }

        if (this.roleFilter !== 'all') {
          params.role = this.roleFilter
        }

        if (this.statusFilter !== 'all') {
          params.isActive = this.statusFilter === 'active'
        }

        const { data } = await api.get('/admin/users', { params })
        this.users = data.users
        this.pagination.total = data.total
        this.pagination.page = data.page
        this.pagination.totalPages = data.totalPages
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchRoles() {
      try {
        const { data } = await api.get('/admin/roles')
        this.roles = data
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    },

    async fetchStats() {
      try {
        const { data } = await api.get('/admin/users/stats')
        this.stats = data
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      }
    },

    async createUser(userData: CreateUserData) {
      try {
        const { data } = await api.post('/admin/users', userData)
        await this.fetchUsers()
        await this.fetchStats()
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } }
        let message = 'Failed to create user'
        if (axiosError.response?.data?.message) {
          message = Array.isArray(axiosError.response.data.message)
            ? axiosError.response.data.message.join(', ')
            : axiosError.response.data.message
        }
        return { success: false, message }
      }
    },

    async updateUser(id: number, updateData: UpdateUserData) {
      try {
        const { data } = await api.patch(`/admin/users/${id}`, updateData)
        await this.fetchUsers()
        await this.fetchStats()
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } }
        let message = 'Failed to update user'
        if (axiosError.response?.data?.message) {
          message = Array.isArray(axiosError.response.data.message)
            ? axiosError.response.data.message.join(', ')
            : axiosError.response.data.message
        }
        return { success: false, message }
      }
    },

    async updateUserRoles(id: number, roleIds: number[]) {
      try {
        const { data } = await api.patch(`/admin/users/${id}/roles`, { roleIds })
        await this.fetchUsers()
        await this.fetchStats()
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to update user roles'
        return { success: false, message }
      }
    },

    async updateUserStatus(id: number, isActive: boolean) {
      try {
        const { data } = await api.patch(`/admin/users/${id}/status`, { isActive })
        // Update local state
        const user = this.users.find((u) => u.id === id)
        if (user) {
          user.isActive = isActive
        }
        await this.fetchStats()
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to update user status'
        return { success: false, message }
      }
    },

    async deleteUser(id: number) {
      try {
        await api.delete(`/admin/users/${id}`)
        await this.fetchUsers()
        await this.fetchStats()
        return { success: true }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to delete user'
        return { success: false, message }
      }
    },

    async getUserById(id: number) {
      try {
        const { data } = await api.get(`/admin/users/${id}`)
        return data as User
      } catch (error) {
        console.error('Failed to fetch user:', error)
        return null
      }
    },
  },
})
