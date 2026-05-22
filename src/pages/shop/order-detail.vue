<template>
  <view class="page-container">
    <view class="order-header">
      <view class="header-left" @click="goBack">
        <text>‹</text>
      </view>
      <text class="header-title">订单详情</text>
      <view class="header-right"></view>
    </view>

    <view class="order-status card">
      <view class="status-icon">{{ getStatusIcon(order.status) }}</view>
      <view class="status-info">
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text class="order-no">订单号：{{ order.orderNo }}</text>
      </view>
    </view>

    <view class="address-card card">
      <view class="address-icon">📍</view>
      <view class="address-info">
        <view class="address-top">
          <text class="address-name">{{ order.address.name }}</text>
          <text class="address-phone">{{ order.address.phone }}</text>
        </view>
        <text class="address-detail">{{ order.address.detail }}</text>
      </view>
    </view>

    <view class="products-card card">
      <text class="card-title">商品清单</text>
      <view class="products-list">
        <view v-for="item in order.items" :key="item.id" class="product-item">
          <image :src="item.image" class="product-image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-spec">{{ item.spec }}</text>
            <view class="product-bottom">
              <text class="product-price">¥{{ item.price }}</text>
              <text class="product-count">x{{ item.count }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="order-info card">
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ order.createTime }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">配送方式</text>
        <text class="info-value">{{ order.deliveryType === 'delivery' ? '送货上门' : '到店自提' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">订单金额</text>
        <text class="info-value price">¥{{ order.totalAmount }}</text>
      </view>
    </view>

    <view class="actions-section" v-if="order.status === 'pending'">
      <button class="btn-outline" @click="rejectOrder">拒绝订单</button>
      <button class="btn-primary" @click="acceptOrder">确认接单</button>
    </view>

    <view class="actions-section" v-else-if="order.status === 'accepted'">
      <button class="btn-primary" @click="finishOrder">完成订单</button>
    </view>

    <view class="actions-section" v-else-if="order.status === 'completed'">
      <button class="btn-outline" @click="viewDetails">查看详情</button>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const order = ref({
      id: 1,
      orderNo: 'DD202401150001',
      status: 'pending',
      createTime: '2024-01-15 14:30:00',
      deliveryType: 'delivery',
      totalAmount: 45,
      address: {
        name: '张女士',
        phone: '138****8888',
        detail: '3号楼2单元101室'
      },
      items: [
        { id: 1, name: '新疆哈密瓜', spec: '2个装', price: 20, count: 2, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=hami%20melon&image_size=square' },
        { id: 2, name: '有机草莓', spec: '500g', price: 5, count: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=strawberries&image_size=square' }
      ]
    })

    const getStatusIcon = (status) => {
      const icons = {
        pending: '⏳',
        accepted: '✅',
        completed: '🎉',
        rejected: '❌'
      }
      return icons[status] || '📦'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: '待确认',
        accepted: '进行中',
        completed: '已完成',
        rejected: '已拒绝'
      }
      return texts[status] || '未知状态'
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const acceptOrder = () => {
      uni.showModal({
        title: '确认接单',
        content: '确认接此订单吗？',
        success: (res) => {
          if (res.confirm) {
            order.value.status = 'accepted'
            uni.showToast({ title: '已接单', icon: 'success' })
          }
        }
      })
    }

    const rejectOrder = () => {
      uni.showModal({
        title: '拒绝订单',
        content: '确定拒绝此订单吗？',
        success: (res) => {
          if (res.confirm) {
            order.value.status = 'rejected'
            uni.showToast({ title: '已拒绝', icon: 'none' })
          }
        }
      })
    }

    const finishOrder = () => {
      uni.showModal({
        title: '完成订单',
        content: '确认订单已完成吗？',
        success: (res) => {
          if (res.confirm) {
            order.value.status = 'completed'
            uni.showToast({ title: '订单已完成', icon: 'success' })
          }
        }
      })
    }

    const viewDetails = () => {
      uni.showToast({ title: '订单详情', icon: 'none' })
    }

    return {
      order,
      getStatusIcon,
      getStatusText,
      goBack,
      acceptOrder,
      rejectOrder,
      finishOrder,
      viewDetails
    }
  }
}
</script>

<style lang="scss" scoped>
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  padding-top: 60rpx;
  background: $bg-white;

  .header-left,
  .header-right {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      font-size: $font-size-xl;
    }
  }

  .header-title {
    font-size: $font-size-lg;
    font-weight: 600;
  }
}

.order-status {
  margin: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;

  .status-icon {
    font-size: 56rpx;
    margin-right: 20rpx;
  }

  .status-info {
    .status-text {
      display: block;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 4rpx;
    }

    .order-no {
      font-size: $font-size-xs;
      color: $text-light;
    }
  }
}

.address-card {
  margin: 0 20rpx 20rpx;
  padding: 20rpx;
  display: flex;
  background: #FFF5F0;

  .address-icon {
    font-size: 36rpx;
    margin-right: 16rpx;
  }

  .address-info {
    flex: 1;

    .address-top {
      display: flex;
      gap: 16rpx;
      margin-bottom: 8rpx;

      .address-name {
        font-size: $font-size-base;
        font-weight: 500;
        color: $text-color;
      }

      .address-phone {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .address-detail {
      font-size: $font-size-sm;
      color: $text-color;
    }
  }
}

.products-card,
.order-info {
  margin: 0 20rpx 20rpx;
  padding: 20rpx;

  .card-title {
    display: block;
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 16rpx;
  }
}

.products-list {
  .product-item {
    display: flex;
    padding: 12rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .product-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-sm;
      margin-right: 16rpx;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .product-name {
        font-size: $font-size-sm;
        color: $text-color;
      }

      .product-spec {
        font-size: $font-size-xs;
        color: $text-secondary;
      }

      .product-bottom {
        display: flex;
        justify-content: space-between;

        .product-price {
          font-size: $font-size-sm;
          color: $primary-color;
          font-weight: 500;
        }

        .product-count {
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }
    }
  }
}

.order-info {
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 12rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    .info-value {
      font-size: $font-size-sm;
      color: $text-color;

      &.price {
        font-size: $font-size-base;
        color: $primary-color;
        font-weight: 600;
      }
    }
  }
}

.actions-section {
  padding: 20rpx;
  display: flex;
  gap: 16rpx;
  padding-bottom: 60rpx;

  button {
    flex: 1;
    height: 88rpx;
  }
}
</style>
