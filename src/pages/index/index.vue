<template>
  <view class="page-container">
    <onboard-guide :visible="showGuide" @close="showGuide = false" />
    
    <view class="header-section">
      <view class="welcome-card card">
        <view class="welcome-header">
          <text class="welcome-title">老板，早上好！</text>
          <text class="welcome-date">{{ currentDate }}</text>
        </view>
        <view class="quick-stats">
          <view class="stat-item">
            <text class="stat-value">{{ todayOrders }}</text>
            <text class="stat-label">今日订单</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ todayRevenue }}</text>
            <text class="stat-label">今日营收</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ newCustomers }}</text>
            <text class="stat-label">新增客户</text>
          </view>
        </view>
      </view>
    </view>

    <view class="quick-actions">
      <text class="section-title">快速操作</text>
      <view class="action-grid">
        <view class="action-item card" @click="goAddProduct">
          <view class="action-icon">📷</view>
          <text class="action-text">上架商品</text>
        </view>
        <view class="action-item card" @click="goOrders">
          <view class="action-icon">📋</view>
          <text class="action-text">订单管理</text>
          <view v-if="pendingOrders > 0" class="action-badge">{{ pendingOrders }}</view>
        </view>
        <view class="action-item card" @click="goGroupBuy">
          <view class="action-icon">👥</view>
          <text class="action-text">发起拼团</text>
        </view>
        <view class="action-item card" @click="goCoupons">
          <view class="action-icon">🎫</view>
          <text class="action-text">发优惠券</text>
        </view>
        <view class="action-item card" @click="goSubscribe">
          <view class="action-icon">🔄</view>
          <text class="action-text">订阅周期购</text>
        </view>
        <view class="action-item card" @click="goGroupOrder">
          <view class="action-icon">📝</view>
          <text class="action-text">社群接龙</text>
        </view>
      </view>
    </view>

    <view class="marketing-section">
      <view class="section-header flex-between">
        <text class="section-title">今日营销建议</text>
        <text class="section-more" @click="goDashboard">查看更多 →</text>
      </view>
      <view class="suggestions-list">
        <view v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item card" @click="executeSuggestion(suggestion)">
          <view class="suggestion-icon" :class="suggestion.type">{{ suggestion.icon }}</view>
          <view class="suggestion-content">
            <text class="suggestion-title">{{ suggestion.title }}</text>
            <text class="suggestion-desc">{{ suggestion.desc }}</text>
          </view>
          <text class="suggestion-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="recent-section">
      <view class="section-header flex-between">
        <text class="section-title">最近订单</text>
        <text class="section-more" @click="goOrders">全部订单 →</text>
      </view>
      <view class="orders-list">
        <view v-for="order in recentOrders" :key="order.id" class="order-item card" @click="goOrderDetail(order.id)">
          <view class="order-header flex-between">
            <text class="order-id">订单号：{{ order.id }}</text>
            <text class="order-status" :class="order.status">{{ order.statusText }}</text>
          </view>
          <view class="order-items">
            <text class="order-item-name">{{ order.items }}</text>
          </view>
          <view class="order-footer flex-between">
            <text class="order-time">{{ order.time }}</text>
            <text class="order-amount">¥{{ order.amount }}</text>
          </view>
        </view>
        <view v-if="recentOrders.length === 0" class="empty-orders">
          <text class="empty-text">暂无订单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import OnboardGuide from '@/components/onboard-guide/onboard-guide.vue'

export default {
  components: { OnboardGuide },
  setup() {
    const showGuide = ref(false)
    
    const todayOrders = ref(12)
    const todayRevenue = ref('¥856')
    const newCustomers = ref(3)
    const pendingOrders = ref(2)

    const currentDate = computed(() => {
      const now = new Date()
      return `${now.getMonth() + 1}月${now.getDate()}日 ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]}`
    })

    const suggestions = ref([
      { icon: '🍓', title: '草莓快到期了', desc: '库存还剩5斤，建议设为今日特价', type: 'warning', action: 'discount' },
      { icon: '💰', title: '3天没下单的客户', desc: '有8位客户超过30天没来，发张5元券召回', type: 'info', action: 'coupon' },
      { icon: '📈', title: '周二会员日', desc: '今天是会员日，全场9折活动进行中', type: 'success', action: 'activity' }
    ])

    const recentOrders = ref([
      { id: 'DD20260522001', items: '新疆哈密瓜 2个', amount: 40, time: '10:30', status: 'pending', statusText: '待确认' },
      { id: 'DD20260522002', items: '冰镇可乐 2瓶', amount: 8, time: '09:15', status: 'done', statusText: '已完成' },
      { id: 'DD20260522003', items: '进口车厘子 1斤', amount: 68, time: '08:45', status: 'done', statusText: '已完成' }
    ])

    const checkOnboard = () => {
      const hasOnboarded = uni.getStorageSync('hasOnboarded')
      if (!hasOnboarded) {
        setTimeout(() => {
          showGuide.value = true
        }, 500)
      }
    }

    const goAddProduct = () => {
      uni.navigateTo({ url: '/pages/shop/add-product' })
    }

    const goOrders = () => {
      uni.switchTab({ url: '/pages/shop/products' })
    }

    const goGroupBuy = () => {
      uni.navigateTo({ url: '/pages/marketing/group-buy' })
    }

    const goCoupons = () => {
      uni.navigateTo({ url: '/pages/customer/coupons' })
    }

    const goSubscribe = () => {
      uni.navigateTo({ url: '/pages/marketing/subscribe' })
    }

    const goGroupOrder = () => {
      uni.navigateTo({ url: '/pages/marketing/group-order' })
    }

    const goDashboard = () => {
      uni.switchTab({ url: '/pages/dashboard/index' })
    }

    const goOrderDetail = (orderId) => {
      uni.navigateTo({ url: `/pages/shop/order-detail?id=${orderId}` })
    }

    const executeSuggestion = (suggestion) => {
      if (suggestion.action === 'discount') {
        uni.navigateTo({ url: '/pages/shop/products' })
      } else if (suggestion.action === 'coupon') {
        uni.navigateTo({ url: '/pages/customer/coupons' })
      }
    }

    onMounted(() => {
      checkOnboard()
    })

    return {
      showGuide,
      todayOrders,
      todayRevenue,
      newCustomers,
      pendingOrders,
      currentDate,
      suggestions,
      recentOrders,
      goAddProduct,
      goOrders,
      goGroupBuy,
      goCoupons,
      goSubscribe,
      goGroupOrder,
      goDashboard,
      goOrderDetail,
      executeSuggestion
    }
  }
}
</script>

<style lang="scss" scoped>
.header-section {
  padding: 20rpx;
}

.welcome-card {
  padding: 30rpx;
  background: linear-gradient(135deg, #FF6B35, #E85D04);
  border-radius: $radius-lg;

  .welcome-header {
    margin-bottom: 24rpx;

    .welcome-title {
      display: block;
      font-size: $font-size-xl;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 8rpx;
    }

    .welcome-date {
      font-size: $font-size-sm;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .quick-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 20rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: $font-size-xl;
        font-weight: 600;
        color: #FFFFFF;
        margin-bottom: 4rpx;
      }

      .stat-label {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .stat-divider {
      width: 1rpx;
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.quick-actions {
  padding: 0 20rpx 20rpx;

  .section-title {
    display: block;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 16rpx;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
  }

  .action-item {
    position: relative;
    padding: 24rpx 16rpx;
    text-align: center;

    .action-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }

    .action-text {
      font-size: $font-size-sm;
      color: $text-color;
    }

    .action-badge {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      min-width: 32rpx;
      height: 32rpx;
      background: #FF4757;
      color: #FFFFFF;
      font-size: 20rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;
    }
  }
}

.marketing-section {
  padding: 0 20rpx 20rpx;

  .section-header {
    margin-bottom: 16rpx;

    .section-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-color;
    }

    .section-more {
      font-size: $font-size-sm;
      color: $primary-color;
    }
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    padding: 20rpx;

    .suggestion-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-right: 16rpx;

      &.warning {
        background: #FFF5F0;
      }

      &.info {
        background: #E3F2FD;
      }

      &.success {
        background: #E8F5E9;
      }
    }

    .suggestion-content {
      flex: 1;

      .suggestion-title {
        display: block;
        font-size: $font-size-base;
        font-weight: 500;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .suggestion-desc {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .suggestion-arrow {
      font-size: $font-size-xl;
      color: $text-light;
    }
  }
}

.recent-section {
  padding: 0 20rpx 40rpx;

  .section-header {
    margin-bottom: 16rpx;

    .section-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-color;
    }

    .section-more {
      font-size: $font-size-sm;
      color: $primary-color;
    }
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .order-item {
    padding: 20rpx;

    .order-header {
      margin-bottom: 12rpx;

      .order-id {
        font-size: $font-size-sm;
        color: $text-secondary;
      }

      .order-status {
        font-size: $font-size-xs;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;

        &.pending {
          background: #FFF5F0;
          color: #FF6B35;
        }

        &.done {
          background: #E8F5E9;
          color: #2E7D32;
        }
      }
    }

    .order-items {
      margin-bottom: 12rpx;

      .order-item-name {
        font-size: $font-size-base;
        color: $text-color;
      }
    }

    .order-footer {
      .order-time {
        font-size: $font-size-xs;
        color: $text-light;
      }

      .order-amount {
        font-size: $font-size-base;
        font-weight: 600;
        color: $primary-color;
      }
    }
  }

  .empty-orders {
    padding: 40rpx;
    text-align: center;
    background: $bg-white;
    border-radius: $radius-lg;

    .empty-text {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }
}
</style>
