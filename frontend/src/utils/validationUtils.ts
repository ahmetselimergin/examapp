export const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Bu alan zorunludur'
    }
    return true
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return 'Geçerli bir e-posta adresi girin'
    }
    return true
  },

  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `En az ${min} karakter olmalıdır`
    }
    return true
  },

  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `En fazla ${max} karakter olmalıdır`
    }
    return true
  },

  min: (min: number) => (value: number) => {
    if (value !== null && value !== undefined && value < min) {
      return `En az ${min} olmalıdır`
    }
    return true
  },

  max: (max: number) => (value: number) => {
    if (value !== null && value !== undefined && value > max) {
      return `En fazla ${max} olmalıdır`
    }
    return true
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (value && !regex.test(value)) {
      return message
    }
    return true
  },

  phone: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Geçerli bir telefon numarası girin'
    }
    return true
  },

  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return 'Geçerli bir URL girin'
    }
  }
}

export const createValidator = (...validators: Array<(value: any) => string | boolean>) => {
  return (value: any) => {
    for (const validator of validators) {
      const result = validator(value)
      if (result !== true) {
        return result
      }
    }
    return true
  }
}
