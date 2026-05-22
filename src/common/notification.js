class NotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const stored = uni.getStorageSync('notifications')
      if (stored) {
        this.notifications = JSON.parse(stored)
      }
    } catch (e) {
      this.notifications = []
    }
  }

  saveToStorage() {
    try {
      uni.setStorageSync('notifications', JSON.stringify(this.notifications))
    } catch (e) {
      console.error('保存通知失败:', e)
    }
  }

  addNotification(type, title, content, data = {}) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      content,
      data,
      read: false,
      createdAt: Date.now()
    }

    this.notifications.unshift(notification)
    
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100)
    }

    this.saveToStorage()
    this.notifyListeners()

    if (type === 'activity_expire') {
      uni.showToast({
        title: content,
        icon: 'none',
        duration: 3000
      })
    }

    return notification
  }

  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id)
    if (notif) {
      notif.read = true
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.saveToStorage()
    this.notifyListeners()
  }

  removeNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      this.notifications.splice(index, 1)
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  clearAll() {
    this.notifications = []
    this.saveToStorage()
    this.notifyListeners()
  }

  getNotifications() {
    return [...this.notifications]
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  async checkActivityExpiry() {
    try {
      const activities = await this.getActiveActivities()
      
      activities.forEach(activity => {
        const endTime = activity.end_time
        const now = Date.now()
        const threeDays = 3 * 24 * 60 * 60 * 1000
        
        if (endTime && endTime - now < threeDays && endTime > now) {
          const existingNotif = this.notifications.find(
            n => n.type === 'activity_expire' && n.data.activityId === activity._id
          )
          
          if (!existingNotif) {
            const daysLeft = Math.ceil((endTime - now) / (24 * 60 * 60 * 1000))
            this.addNotification(
              'activity_expire',
              '活动即将结束',
              `「${activity.title}」还有${daysLeft}天结束`,
              { activityId: activity._id, activityTitle: activity.title }
            )
          }
        }
      })
    } catch (e) {
      console.error('检查活动到期失败:', e)
    }
  }

  async getActiveActivities() {
    return []
  }

  notifyNewActivity(activity) {
    this.addNotification(
      'new_activity',
      '新活动创建成功',
      `「${activity.title}」已创建，快去分享吧！`,
      { activityId: activity._id, activityTitle: activity.title }
    )
  }

  notifyCustomerJoined(customer, activity) {
    this.addNotification(
      'customer_join',
      '新客户参与活动',
      `客户「${customer.nickname || '微信用户'}」参与了「${activity.title}」`,
      { customerId: customer._id, activityId: activity._id }
    )
  }

  notifySystem(message) {
    this.addNotification(
      'system',
      '系统通知',
      message,
      {}
    )
  }
}

export const notificationService = new NotificationService()

export const NOTIFICATION_TYPES = {
  ACTIVITY_EXPIRE: 'activity_expire',
  NEW_ACTIVITY: 'new_activity',
  CUSTOMER_JOIN: 'customer_join',
  SYSTEM: 'system'
}

export const NOTIFICATION_ICONS = {
  activity_expire: '⏰',
  new_activity: '🎉',
  customer_join: '👤',
  system: '📢'
}