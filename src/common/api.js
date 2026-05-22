import { errorHandler, createError, ERROR_CODES } from './errorHandler.js'

const db = wx.cloud.database()
const _ = db.command

async function callFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const error = createError(ERROR_CODES.TIMEOUT, '云函数调用超时')
      errorHandler.captureError(error, { action: name, params: data })
      reject(error)
    }, 10000)

    wx.cloud.callFunction({ name, data })
      .then(res => {
        clearTimeout(timeout)
        const result = res.result
        
        if (result && result.code !== undefined) {
          if (result.code === 0) {
            resolve(result)
          } else {
            const error = createError(ERROR_CODES.BUSINESS_ERROR, result.message || '操作失败')
            errorHandler.captureError(error, { action: name, params: data })
            reject(error)
          }
        } else {
          resolve(result)
        }
      })
      .catch(err => {
        clearTimeout(timeout)
        let error
        
        if (err.errMsg && err.errMsg.includes('timeout')) {
          error = createError(ERROR_CODES.TIMEOUT, '请求超时')
        } else if (err.errMsg && err.errMsg.includes('auth')) {
          error = createError(ERROR_CODES.AUTH_ERROR, '授权失败')
        } else {
          error = createError(ERROR_CODES.NETWORK_ERROR, err.message || '网络错误')
        }
        
        errorHandler.captureError(error, { action: name, params: data })
        reject(error)
      })
  })
}

export async function getOpenId() {
  try {
    return await callFunction('getOpenId')
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function getActivities(status) {
  try {
    return await callFunction('activityManager', { action: 'list', status })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function getActivityDetail(id) {
  try {
    return await callFunction('activityManager', { action: 'detail', id })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function createActivity(data) {
  try {
    return await callFunction('activityManager', { action: 'create', data })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function updateActivity(id, data) {
  try {
    return await callFunction('activityManager', { action: 'update', id, data })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function deleteActivity(id) {
  try {
    return await callFunction('activityManager', { action: 'delete', id })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function endActivity(id) {
  try {
    return await callFunction('activityManager', { action: 'end', id })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function getCustomers(params = {}) {
  try {
    return await callFunction('customerManager', { action: 'list', ...params })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function getCustomerDetail(id) {
  try {
    return await callFunction('customerManager', { action: 'detail', id })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function updateCustomerTags(id, tags) {
  try {
    return await callFunction('customerManager', { action: 'updateTags', id, tags })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function updateCustomerPhone(id, phone) {
  try {
    return await callFunction('customerManager', { action: 'updatePhone', id, phone })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function getActivityStats(activityId) {
  try {
    return await callFunction('statsManager', { action: 'activityStats', activityId })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function getOverviewStats() {
  try {
    return await callFunction('statsManager', { action: 'overview' })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function generatePoster(activityId, templateType) {
  try {
    return await callFunction('posterGenerator', { activityId, templateType })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function recordCustomerAction(activityId, actionType) {
  try {
    return await callFunction('statsManager', { action: 'record', activityId, actionType })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function getShopConfig() {
  try {
    return await callFunction('getOpenId', { action: 'getShop' })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export async function updateShopConfig(data) {
  try {
    return await callFunction('getOpenId', { action: 'updateShop', data })
  } catch (error) {
    errorHandler.showError(error)
    throw error
  }
}

export default {
  getOpenId,
  getActivities,
  getActivityDetail,
  createActivity,
  updateActivity,
  deleteActivity,
  endActivity,
  getCustomers,
  getCustomerDetail,
  updateCustomerTags,
  updateCustomerPhone,
  getActivityStats,
  getOverviewStats,
  generatePoster,
  recordCustomerAction,
  getShopConfig,
  updateShopConfig
}