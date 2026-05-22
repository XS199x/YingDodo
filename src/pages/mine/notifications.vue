<template>
  <view class="page-container">
    <view class="page-header flex-between">
      <text class="page-title">消息中心</text>
      <text class="header-action" @click="markAllRead" v-if="unreadCount > 0">全部已读</text>
      <text class="header-action" @click="clearAll" v-else>清空</text>
    </view>

    <view v-if="notifications.length === 0" class="empty-area">
      <view class="empty-icon">🔔</view>
      <text class="empty-text">暂无消息</text>
      <text class="empty-subtext">有新消息时会在这里提醒您</text>
    </view>

    <view v-else class="notification-list">
      <view
        v-for="item in notifications"
        :key="item.id"
        class="notification-item card"
        :class="{ unread: !item.read }"
        @click="handleNotification(item)"
      >
        <view class="notif-icon">{{ getIcon(item.type) }}</view>
        <view class="notif-content">
          <view class="notif-title">{{ item.title }}</view>
          <view class="notif-desc">{{ item.content }}</view>
          <view class="notif-time">{{ formatTime(item.createdAt) }}</view>
        </view>
        <view class="notif-badge" v-if="!item.read"></view>
      </view>
    </view>

    <view class="notification-detail-modal" v-if="showDetail" @click="closeDetail">
      <view class="detail-content" @click.stop>
        <view class="detail-header">
          <text class="detail-icon">{{ getIcon(selectedNotif?.type) }}</text>
          <text class="detail-title">{{ selectedNotif?.title }}</text>
        </view>
        <view class="detail-body">
          <text class="detail-text">{{ selectedNotif?.content }}</text>
          <view class="detail-meta">
            <text class="detail-time">{{ formatTime(selectedNotif?.createdAt) }}</text>
          </view>
        </view>
        <view class="detail-footer">
          <button class="btn-primary" @click="goActivity" v-if="selectedNotif?.data?.activityId">
            查看活动
          </button>
          <button class="btn-outline" @click="closeDetail">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { onShow, onUnmounted } from '@dcloudio/uni-app'
import { notificationService, NOTIFICATION_ICONS } from '@/common/notification.js'

export default {
  data() {
    return {
      notifications: [],
      showDetail: false,
      selectedNotif: null,
      unsubscribe: null
    }
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.read).length
    }
  },
  onShow() {
    this.loadNotifications()
    this.unsubscribe = notificationService.subscribe(() => {
      this.loadNotifications()
    })
  },
  onUnmounted() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  methods: {
    loadNotifications() {
      this.notifications = notificationService.getNotifications()
    },
    getIcon(type) {
      return NOTIFICATION_ICONS[type] || '📢'
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    handleNotification(item) {
      notificationService.markAsRead(item.id)
      this.selectedNotif = item
      this.showDetail = true
    },
    closeDetail() {
      this.showDetail = false
      this.selectedNotif = null
    },
    markAllRead() {
      notificationService.markAllAsRead()
      uni.showToast({ title: '已全部标记为已读', icon: 'success' })
    },
    clearAll() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有消息吗？',
        success: (res) => {
          if (res.confirm) {
            notificationService.clearAll()
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    },
    goActivity() {
      if (this.selectedNotif?.data?.activityId) {
        uni.navigateTo({
          url: `/pages/activity/detail?id=${this.selectedNotif.data.activityId}`
        })
        this.closeDetail()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  padding: 24rpx 20rpx;
  background: $bg-white;

  .page-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-color;
  }

  .header-action {
    font-size: $font-size-sm;
    color: $primary-color;
  }
}

.empty-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: $font-size-base;
    color: $text-color;
    margin-bottom: 8rpx;
  }

  .empty-subtext {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.notification-list {
  padding: 12rpx 20rpx;
}

.notification-item {
  display: flex;
  padding: 20rpx;
  margin-bottom: 12rpx;
  transition: all 0.3s;

  &.unread {
    background: rgba($primary-color, 0.03);
    border-left: 4rpx solid $primary-color;
  }

  .notif-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  .notif-content {
    flex: 1;
    min-width: 0;

    .notif-title {
      font-size: $font-size-base;
      font-weight: 500;
      color: $text-color;
      margin-bottom: 4rpx;
    }

    .notif-desc {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-bottom: 8rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notif-time {
      font-size: $font-size-xs;
      color: $text-light;
    }
  }

  .notif-badge {
    width: 12rpx;
    height: 12rpx;
    background: $primary-color;
    border-radius: 50%;
    margin-left: 12rpx;
  }
}

.notification-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 40rpx;

  .detail-content {
    width: 100%;
    max-width: 600rpx;
    background: $bg-white;
    border-radius: $radius-lg;
    overflow: hidden;
  }

  .detail-header {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: rgba($primary-color, 0.1);

    .detail-icon {
      font-size: 48rpx;
      margin-right: 16rpx;
    }

    .detail-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-color;
    }
  }

  .detail-body {
    padding: 24rpx;

    .detail-text {
      font-size: $font-size-base;
      color: $text-color;
      line-height: 1.6;
    }

    .detail-meta {
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #DDDDDD;

      .detail-time {
        font-size: $font-size-sm;
        color: $text-light;
      }
    }
  }

  .detail-footer {
    display: flex;
    padding: 20rpx 24rpx;
    gap: 20rpx;

    button {
      flex: 1;
      height: 80rpx;
    }
  }
}
</style>