const db = wx.cloud.database()
const _ = db.command

function callFunction(name, data = {}) {
  return wx.cloud.callFunction({ name, data }).then(res => res.result)
}

export function getOpenId() {
  return callFunction('getOpenId')
}

export function getActivities(status) {
  return callFunction('activityManager', { action: 'list', status })
}

export function getActivityDetail(id) {
  return callFunction('activityManager', { action: 'detail', id })
}

export function createActivity(data) {
  return callFunction('activityManager', { action: 'create', data })
}

export function updateActivity(id, data) {
  return callFunction('activityManager', { action: 'update', id, data })
}

export function deleteActivity(id) {
  return callFunction('activityManager', { action: 'delete', id })
}

export function endActivity(id) {
  return callFunction('activityManager', { action: 'end', id })
}

export function getCustomers(params = {}) {
  return callFunction('customerManager', { action: 'list', ...params })
}

export function getCustomerDetail(id) {
  return callFunction('customerManager', { action: 'detail', id })
}

export function updateCustomerTags(id, tags) {
  return callFunction('customerManager', { action: 'updateTags', id, tags })
}

export function updateCustomerPhone(id, phone) {
  return callFunction('customerManager', { action: 'updatePhone', id, phone })
}

export function getActivityStats(activityId) {
  return callFunction('statsManager', { action: 'activityStats', activityId })
}

export function getOverviewStats() {
  return callFunction('statsManager', { action: 'overview' })
}

export function generatePoster(activityId, templateType) {
  return callFunction('posterGenerator', { activityId, templateType })
}

export function recordCustomerAction(activityId, actionType) {
  return callFunction('statsManager', { action: 'record', activityId, actionType })
}

export function getShopConfig() {
  return callFunction('getOpenId', { action: 'getShop' })
}

export function updateShopConfig(data) {
  return callFunction('getOpenId', { action: 'updateShop', data })
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