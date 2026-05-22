const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR'
}

const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接异常，请检查网络设置',
  [ERROR_CODES.TIMEOUT]: '请求超时，请稍后重试',
  [ERROR_CODES.AUTH_ERROR]: '登录状态已过期，请重新登录',
  [ERROR_CODES.SERVER_ERROR]: '服务器繁忙，请稍后重试',
  [ERROR_CODES.VALIDATION_ERROR]: '数据验证失败，请检查输入内容',
  [ERROR_CODES.BUSINESS_ERROR]: '操作失败，请稍后重试'
}

class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogCount = 50
  }

  captureError(error, context = {}) {
    const errorInfo = {
      timestamp: Date.now(),
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      code: error.code || ERROR_CODES.BUSINESS_ERROR,
      context: {
        page: context.page || '',
        action: context.action || '',
        params: context.params || {},
        url: context.url || ''
      },
      userAgent: uni.getSystemInfoSync?.() || {}
    }

    if (this.errorLog.length >= this.maxLogCount) {
      this.errorLog.shift()
    }
    this.errorLog.push(errorInfo)

    console.error('[Error Capture]', errorInfo)

    if (error.code === ERROR_CODES.AUTH_ERROR) {
      this.handleAuthError()
    }

    this.reportError(errorInfo)
  }

  handleAuthError() {
    uni.showModal({
      title: '登录过期',
      content: '您的登录状态已过期，请重新登录',
      showCancel: false,
      success: () => {
        uni.clearStorageSync()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    })
  }

  reportError(errorInfo) {
    try {
      if (process.env.NODE_ENV === 'production') {
        uni.request({
          url: 'https://api.example.com/report-error',
          method: 'POST',
          data: errorInfo,
          success: () => {},
          fail: () => {}
        })
      }
    } catch (e) {
      console.error('Error reporting failed:', e)
    }
  }

  showError(error, showToast = true) {
    const code = error.code || ERROR_CODES.BUSINESS_ERROR
    const message = error.message || ERROR_MESSAGES[code] || '操作失败'

    if (showToast) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    }

    return message
  }

  getErrorLog() {
    return [...this.errorLog]
  }

  clearErrorLog() {
    this.errorLog = []
  }
}

export const errorHandler = new ErrorHandler()

export { ERROR_CODES, ERROR_MESSAGES }

export function createError(code, message, context = {}) {
  const error = new Error(message || ERROR_MESSAGES[code])
  error.code = code
  error.context = context
  return error
}

export function wrapAsync(fn) {
  return async function(...args) {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.captureError(error, {
        action: fn.name || 'anonymous'
      })
      throw error
    }
  }
}