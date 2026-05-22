<template>
  <view class="page-container">
    <view class="tabs-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.key" 
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <text>{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
      </view>
    </view>

    <view class="orders-list">
      <view v-for="order in orders" :key="order.id" class="order-card card" @click="goDetail(order.id)">
        <view class="order-header">
          <view class="order-info">
            <text class="order-id">订单号：{{ order.id }}</text>
            <text class="order-time">{{ order.time }}</text>
          </view>
          <view class="order-status" :class="order.status">{{ order.statusText }}</view>
        </view>

        <view class="order-items">
          <view v-for="item in order.items" :key="item.id" class="order-item">
            <image :src="item.image" class="item-image" mode="aspectFill" />
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-spec">数量：{{ item.quantity }}</text>
            </view>
            <text class="item-price">¥{{ item.price * item.quantity }}</text>
          </view>
        </view>

        <view class="order-footer">
          <view class="delivery-info">
            <text class="delivery-icon">{{ order.deliveryType === 'delivery' ? '🚗' : '🏪' }}</text>
            <text class="delivery-text">{{ order.address || '到店自提' }}</text>
          </view>
          <view class="order-total">
            <text class="total-label">合计：</text>
            <text class="total-amount">¥{{ order.total }}</text>
          </view>
        </view>

        <view class="order-actions" v-if="order.status === 'pending'">
          <button class="btn-outline btn-sm" @click.stop="rejectOrder(order)">拒绝</button>
          <button class="btn-primary btn-sm" @click.stop="acceptOrder(order)">确认接单</button>
        </view>

        <view class="order-actions" v-else-if="order.status === 'accepted'">
          <button class="btn-primary btn-sm" @click.stop="finishOrder(order)">完成订单</button>
        </view>
      </view>
    </view>

    <view v-if="orders.length === 0" class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无订单</text>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const activeTab = ref('all')

    const tabs = ref([
      { key: 'all', label: '全部', count: 5 },
      { key: 'pending', label: '待确认', count: 2 },
      { key: 'accepted', label: '进行中', count: 1 },
      { key: 'done', label: '已完成', count: 2 }
    ])

    const orders = ref([
      {
        id: 'DD20260522001',
        time: '今天 10:30',
        status: 'pending',
        statusText: '待确认',
        deliveryType: 'delivery',
        address: '3号楼2单元',
        total: 40,
        items: [
          { id: 1, name: '新疆哈密瓜', price: 20, quantity: 2, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=hami%20melon&image_size=square' }
        ]
      },
      {
        id: 'DD20260522002',
        time: '今天 09:15',
        status: 'accepted',
        statusText: '配送中',
        deliveryType: 'delivery',
        address: '5号楼1单元',
        total: 16,
        items: [
          { id: 2, name: '冰镇可乐 2L', price: 8, quantity: 2, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cola%20bottle&image_size=square' }
        ]
      },
      {
        id: 'DD20260522003',
        time: '今天 08:45',
        status: 'done',
        statusText: '已完成',
        deliveryType: 'pickup',
        total: 68,
        items: [
          { id: 3, name: '进口车厘子', price: 68, quantity: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cherries&image_size=square' }
        ]
      },
      {
        id: 'DD20260521001',
        time: '昨天 16:20',
        status: 'done',
        statusText: '已完成',
        deliveryType: 'pickup',
        total: 35,
        items: [
          { id: 4, name: '有机草莓', price: 35, quantity: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=strawberries&image_size=square' }
        ]
      },
      {
        id: 'DD20260522004',
        time: '今天 11:00',
        status: 'pending',
        statusText: '待确认',
        deliveryType: 'delivery',
        address: '2号楼3单元',
        total: 58,
        items: [
          { id: 5, name: '蒙牛纯牛奶', price: 58, quantity: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=milk%20box&image_size=square' }
        ]
      }
    ])

    const goDetail = (orderId) => {
      uni.navigateTo({ url: `/pages/shop/order-detail?id=${orderId}` })
    }

    const acceptOrder = (order) => {
      uni.showModal({
        title: '确认接单',
        content: `确认接下订单 ${order.id} 吗？`,
        success: (res) => {
          if (res.confirm) {
            order.status = 'accepted'
            order.statusText = '配送中'
            uni.showToast({ title: '已接单', icon: 'success' })
          }
        }
      })
    }

    const rejectOrder = (order) => {
      uni.showModal({
        title: '拒绝订单',
        content: `确定拒绝订单 ${order.id} 吗？`,
        success: (res) => {
          if (res.confirm) {
            order.status = 'rejected'
            order.statusText = '已拒绝'
            uni.showToast({ title: '已拒绝', icon: 'none' })
          }
        }
      })
    }

    const finishOrder = (order) => {
      uni.showModal({
        title: '完成订单',
        content: `确认订单 ${order.id} 已完成？`,
        success: (res) => {
          if (res.confirm) {
            order.status = 'done'
            order.statusText = '已完成'
            uni.showToast({ title: '订单已完成', icon: 'success' })
          }
        }
      })
    }

    return {
      activeTab,
      tabs,
      orders,
      goDetail,
      acceptOrder,
      rejectOrder,
      finishOrder
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs-bar {
  display: flex;
  padding: 20rpx;
  background: $bg-white;
  gap: 16rpx;

  .tab-item {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background: $bg-color;
    border-radius: 30rpx;
    font-size: $font-size-sm;
    color: $text-secondary;

    &.active {
      background: $primary-color;
      color: #FFFFFF;
    }

    .tab-badge {
      margin-left: 8rpx;
      min-width: 32rpx;
      height: 32rpx;
      background: #FF4757;
      border-radius: 16rpx;
      font-size: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;
    }
  }
}

.orders-list {
  padding: 20rpx;
}

.order-card {
  margin-bottom: 20rpx;
  padding: 20rpx;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;

    .order-info {
      .order-id {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: 4rpx;
      }

      .order-time {
        font-size: $font-size-xs;
        color: $text-light;
      }
    }

    .order-status {
      padding: 8rpx 16rpx;
      border-radius: 12rpx;
      font-size: $font-size-xs;

      &.pending {
        background: #FFF5F0;
        color: $primary-color;
      }

      &.accepted {
        background: #E3F2FD;
        color: #1976D2;
      }

      &.done {
        background: #E8F5E9;
        color: #2E7D32;
      }

      &.rejected {
        background: #FCE4EC;
        color: #C2185B;
      }
    }
  }

  .order-items {
    margin-bottom: 16rpx;

    .order-item {
      display: flex;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 1rpx solid $bg-color;

      &:last-child {
        border-bottom: none;
      }

      .item-image {
        width: 100rpx;
        height: 100rpx;
        border-radius: $radius-sm;
        margin-right: 16rpx;
      }

      .item-info {
        flex: 1;

        .item-name {
          display: block;
          font-size: $font-size-sm;
          color: $text-color;
          margin-bottom: 4rpx;
        }

        .item-spec {
          font-size: $font-size-xs;
          color: $text-light;
        }
      }

      .item-price {
        font-size: $font-size-sm;
        color: $primary-color;
        font-weight: 500;
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid $bg-color;

    .delivery-info {
      display: flex;
      align-items: center;

      .delivery-icon {
        font-size: $font-size-base;
        margin-right: 8rpx;
      }

      .delivery-text {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .order-total {
      display: flex;
      align-items: baseline;

      .total-label {
        font-size: $font-size-sm;
        color: $text-secondary;
      }

      .total-amount {
        font-size: $font-size-lg;
        font-weight: 600;
        color: $primary-color;
      }
    }
  }

  .order-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid $bg-color;

    button {
      flex: 1;
    }
  }
}

.empty-state {
  padding: 100rpx 40rpx;
  text-align: center;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
    display: block;
  }

  .empty-text {
    font-size: $font-size-base;
    color: $text-light;
  }
}
</style>
