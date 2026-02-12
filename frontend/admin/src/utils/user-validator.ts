export interface CreateUserFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  roleIds: number[]
  isActive: boolean
}

export interface UpdateUserFormData {
  firstName?: string
  lastName?: string
  password?: string
  confirmPassword?: string
  roleIds?: number[]
  isActive?: boolean
}

export const validateCreateUserForm = (data: CreateUserFormData) => {
  const errors: Record<string, string> = {}

  // First name validation
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.'
  } else if (data.firstName.trim().length > 50) {
    errors.firstName = 'First name cannot exceed 50 characters.'
  }

  // Last name validation
  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.'
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = 'Last name cannot exceed 50 characters.'
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  // Password validation
  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else {
    // Check for password strength
    const hasUppercase = /[A-Z]/.test(data.password)
    const hasLowercase = /[a-z]/.test(data.password)
    const hasNumber = /[0-9]/.test(data.password)

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      errors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
    }
  }

  // Confirm password validation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  // Role validation
  if (!data.roleIds || data.roleIds.length === 0) {
    errors.roleIds = 'Please select at least one role.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateUpdateUserForm = (data: UpdateUserFormData) => {
  const errors: Record<string, string> = {}

  // First name validation (if provided)
  if (data.firstName !== undefined) {
    if (data.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters.'
    } else if (data.firstName.trim().length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters.'
    }
  }

  // Last name validation (if provided)
  if (data.lastName !== undefined) {
    if (data.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.'
    } else if (data.lastName.trim().length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters.'
    }
  }

  // Password validation (if provided)
  if (data.password && data.password.length > 0) {
    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    } else {
      const hasUppercase = /[A-Z]/.test(data.password)
      const hasLowercase = /[a-z]/.test(data.password)
      const hasNumber = /[0-9]/.test(data.password)

      if (!hasUppercase || !hasLowercase || !hasNumber) {
        errors.password =
          'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
      }
    }

    // Confirm password validation
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }
  }

  // Role validation (if provided)
  if (data.roleIds !== undefined && data.roleIds.length === 0) {
    errors.roleIds = 'Please select at least one role.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
