<template>
  <view class="page-container">
    <view class="tab-bar">
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'manage' }"
        @click="activeTab = 'manage'"
      >券管理</view>
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'send' }"
        @click="activeTab = 'send'"
      >发券中心</view>
    </view>

    <view v-if="activeTab === 'manage'" class="manage-section">
      <view class="fab-btn" @click="createCoupon">
        <text class="fab-icon">+</text>
      </view>

      <view v-if="coupons.length > 0" class="coupons-list">
        <view v-for="coupon in coupons" :key="coupon.id" class="coupon-card card">
          <view class="coupon-left">
            <text class="coupon-value">{{ coupon.type === 'fixed' ? '¥' + coupon.value : coupon.value + '%' }}</text>
            <text class="coupon-condition">满{{ coupon.minAmount }}可用</text>
          </view>
          <view class="coupon-right">
            <text class="coupon-name">{{ coupon.name }}</text>
            <text class="coupon-desc">{{ coupon.desc }}</text>
            <view class="coupon-footer">
              <text class="coupon-status">{{ coupon.statusText }}</text>
              <text class="coupon-count">{{ coupon.used }}/{{ coupon.total }}张</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">🎫</text>
        <text class="empty-title">还没有优惠券</text>
        <text class="empty-desc">点击右下角创建优惠券</text>
      </view>
    </view>

    <view v-else class="send-section">
      <view class="send-card card">
        <text class="send-title">智能发券</text>
        <view class="send-options">
          <view class="send-option" @click="sendToInactive">
            <view class="option-icon">🔔</view>
            <view class="option-content">
              <text class="option-title">召回沉睡客户</text>
              <text class="option-desc">30天未下单的{{ inactiveCount }}位客户</text>
            </view>
            <text class="option-arrow">›</text>
          </view>
          <view class="send-option" @click="sendToActive">
            <view class="option-icon">⭐</view>
            <view class="option-content">
              <text class="option-title">奖励活跃客户</text>
              <text class="option-desc">本月下单{{ activeCount }}次以上的客户</text>
            </view>
            <text class="option-arrow">›</text>
          </view>
          <view class="send-option" @click="sendByTag">
            <view class="option-icon">🏷️</view>
            <view class="option-content">
              <text class="option-title">按标签发券</text>
              <text class="option-desc">选择特定标签的客户发送</text>
            </view>
            <text class="option-arrow">›</text>
          </view>
          <view class="send-option" @click="sendToAll">
            <view class="option-icon">📤</view>
            <view class="option-content">
              <text class="option-title">全员发券</text>
              <text class="option-desc">发送给所有{{ totalCustomers }}位客户</text>
            </view>
            <text class="option-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="recent-section card">
        <text class="section-title">发券记录</text>
        <view class="recent-list">
          <view v-for="record in sendRecords" :key="record.id" class="recent-item">
            <view class="recent-info">
              <text class="recent-name">{{ record.name }}</text>
              <text class="recent-time">{{ record.time }}</text>
            </view>
            <text class="recent-count">{{ record.count }}人</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <view class="create-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">创建优惠券</text>
          <text class="modal-close" @click="showCreateModal = false">✕</text>
        </view>
        <view class="modal-content">
          <view class="form-item">
            <text class="form-label">券类型</text>
            <view class="type-options">
              <view 
                class="type-option"
                :class="{ selected: couponType === 'fixed' }"
                @click="couponType = 'fixed'"
              >满减券</view>
              <view 
                class="type-option"
                :class="{ selected: couponType === 'percent' }"
                @click="couponType = 'percent'"
              >折扣券</view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">券名称</text>
            <input class="form-input" v-model="couponName" placeholder="如：新人专享券" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ couponType === 'fixed' ? '面额' : '折扣比例' }}</text>
            <view class="value-input-wrap">
              <text class="value-symbol">{{ couponType === 'fixed' ? '¥' : '' }}</text>
              <input class="value-input" v-model="couponValue" type="digit" placeholder="0" />
              <text class="value-symbol" v-if="couponType === 'percent'">%</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">最低消费</text>
            <view class="price-input-wrap">
              <text class="price-symbol">¥</text>
              <input class="price-input" v-model="minAmount" type="digit" placeholder="0" />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">发放数量</text>
            <input class="form-input" v-model="totalCount" type="number" placeholder="100" />
          </view>
          <view class="form-item">
            <text class="form-label">有效期</text>
            <view class="duration-options">
              <view 
                v-for="d in durationOptions" 
                :key="d.value" 
                class="duration-option"
                :class="{ selected: validDuration === d.value }"
                @click="validDuration = d.value"
              >{{ d.label }}</view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-primary" @click="submitCoupon">创建优惠券</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const activeTab = ref('manage')
    const showCreateModal = ref(false)
    const couponType = ref('fixed')
    const couponName = ref('')
    const couponValue = ref('')
    const minAmount = ref('')
    const totalCount = ref('100')
    const validDuration = ref(7)

    const durationOptions = [
      { label: '3天', value: 3 },
      { label: '7天', value: 7 },
      { label: '15天', value: 15 },
      { label: '30天', value: 30 }
    ]

    const coupons = ref([
      { id: 1, name: '新人专享券', desc: '新客户首单可用', type: 'fixed', value: 5, minAmount: 10, used: 23, total: 100, status: 'active', statusText: '进行中' },
      { id: 2, name: '会员日折扣', desc: '每周二全场9折', type: 'percent', value: 10, minAmount: 0, used: 156, total: 500, status: 'active', statusText: '进行中' },
      { id: 3, name: '满减券', desc: '满50减10', type: 'fixed', value: 10, minAmount: 50, used: 89, total: 200, status: 'active', statusText: '进行中' }
    ])

    const inactiveCount = ref(8)
    const activeCount = ref(5)
    const totalCustomers = ref(156)

    const sendRecords = ref([
      { id: 1, name: '召回沉睡客户', time: '今天 10:30', count: 8 },
      { id: 2, name: '全员发券', time: '昨天 14:20', count: 156 },
      { id: 3, name: '按标签发券', time: '前天 09:10', count: 23 }
    ])

    const createCoupon = () => {
      showCreateModal.value = true
    }

    const submitCoupon = () => {
      if (!couponName.value) {
        uni.showToast({ title: '请输入券名称', icon: 'none' })
        return
      }
      if (!couponValue.value) {
        uni.showToast({ title: '请输入面额或折扣', icon: 'none' })
        return
      }

      uni.showLoading({ title: '创建中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '优惠券创建成功', icon: 'success' })
        showCreateModal.value = false
      }, 1000)
    }

    const sendToInactive = () => {
      uni.showToast({ title: '准备发送给沉睡客户', icon: 'none' })
    }

    const sendToActive = () => {
      uni.showToast({ title: '准备发送给活跃客户', icon: 'none' })
    }

    const sendByTag = () => {
      uni.showToast({ title: '选择标签', icon: 'none' })
    }

    const sendToAll = () => {
      uni.showToast({ title: '准备全员发券', icon: 'none' })
    }

    return {
      activeTab,
      showCreateModal,
      couponType,
      couponName,
      couponValue,
      minAmount,
      totalCount,
      validDuration,
      durationOptions,
      coupons,
      inactiveCount,
      activeCount,
      totalCustomers,
      sendRecords,
      createCoupon,
      submitCoupon,
      sendToInactive,
      sendToActive,
      sendByTag,
      sendToAll
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  padding: 20rpx;
  background: $bg-white;

  .tab-item {
    flex: 1;
    padding: 16rpx;
    text-align: center;
    font-size: $font-size-base;
    color: $text-secondary;
    border-radius: $radius-lg;
    background: $bg-color;

    &.active {
      background: $primary-color;
      color: #FFFFFF;
    }
  }
}

.manage-section {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.coupon-card {
  display: flex;
  padding: 0;
  overflow: hidden;

  .coupon-left {
    width: 160rpx;
    background: linear-gradient(135deg, $primary-color, #E85D04);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20rpx;

    .coupon-value {
      font-size: $font-size-xl;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 8rpx;
    }

    .coupon-condition {
      font-size: $font-size-xs;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .coupon-right {
    flex: 1;
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .coupon-name {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color;
    }

    .coupon-desc {
      font-size: $font-size-xs;
      color: $text-secondary;
    }

    .coupon-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 12rpx;

      .coupon-status {
        font-size: $font-size-xs;
        padding: 4rpx 12rpx;
        background: #E8F5E9;
        color: #2E7D32;
        border-radius: 12rpx;
      }

      .coupon-count {
        font-size: $font-size-xs;
        color: $text-light;
      }
    }
  }
}

.empty-state {
  padding: 100rpx 40rpx;
  text-align: center;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
    display: block;
  }

  .empty-title {
    display: block;
    font-size: $font-size-lg;
    color: $text-color;
    margin-bottom: 8rpx;
  }

  .empty-desc {
    font-size: $font-size-sm;
    color: $text-light;
  }
}

.send-section {
  padding: 20rpx;
}

.send-card {
  padding: 20rpx;
  margin-bottom: 20rpx;

  .send-title {
    display: block;
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 20rpx;
  }

  .send-options {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .send-option {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background: $bg-color;
      border-radius: $radius-sm;

      .option-icon {
        font-size: 40rpx;
        margin-right: 16rpx;
      }

      .option-content {
        flex: 1;

        .option-title {
          display: block;
          font-size: $font-size-sm;
          color: $text-color;
          margin-bottom: 4rpx;
        }

        .option-desc {
          font-size: $font-size-xs;
          color: $text-secondary;
        }
      }

      .option-arrow {
        font-size: $font-size-lg;
        color: $text-light;
      }
    }
  }
}

.recent-section {
  padding: 20rpx;

  .section-title {
    display: block;
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 16rpx;
  }

  .recent-list {
    .recent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid $bg-color;

      &:last-child {
        border-bottom: none;
      }

      .recent-info {
        .recent-name {
          display: block;
          font-size: $font-size-sm;
          color: $text-color;
          margin-bottom: 4rpx;
        }

        .recent-time {
          font-size: $font-size-xs;
          color: $text-light;
        }
      }

      .recent-count {
        font-size: $font-size-sm;
        color: $primary-color;
        font-weight: 500;
      }
    }
  }
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 100rpx;
  height: 100rpx;
  background: $primary-color;
  border-radius: $radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.4);

  .fab-icon {
    font-size: 56rpx;
    color: #FFFFFF;
    font-weight: 300;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.create-modal {
  width: 100%;
  background: $bg-white;
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: $safe-bottom-env;
  max-height: 85vh;
  overflow-y: auto;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid $bg-color;

    .modal-title {
      font-size: $font-size-lg;
      font-weight: 600;
    }

    .modal-close {
      font-size: $font-size-xl;
      color: $text-light;
    }
  }

  .modal-content {
    padding: 24rpx;

    .form-item {
      margin-bottom: 20rpx;

      .form-label {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: 12rpx;
      }

      .type-options {
        display: flex;
        gap: 12rpx;

        .type-option {
          flex: 1;
          padding: 16rpx;
          background: $bg-color;
          border-radius: $radius-sm;
          text-align: center;
          font-size: $font-size-sm;
          color: $text-secondary;

          &.selected {
            background: rgba($primary-color, 0.1);
            color: $primary-color;
          }
        }
      }

      .form-input {
        width: 100%;
        height: 80rpx;
        background: $bg-color;
        border-radius: $radius-sm;
        padding: 0 20rpx;
        font-size: $font-size-base;
      }

      .value-input-wrap,
      .price-input-wrap {
        display: flex;
        align-items: center;
        height: 80rpx;
        background: $bg-color;
        border-radius: $radius-sm;
        padding: 0 20rpx;

        .value-symbol,
        .price-symbol {
          font-size: $font-size-lg;
          color: $primary-color;
          font-weight: 600;
        }

        .value-input,
        .price-input {
          flex: 1;
          background: transparent;
          padding: 0;
          margin-left: 8rpx;
          font-size: $font-size-base;
        }
      }

      .duration-options {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .duration-option {
          padding: 12rpx 24rpx;
          background: $bg-color;
          border-radius: 20rpx;
          font-size: $font-size-sm;
          color: $text-secondary;

          &.selected {
            background: rgba($primary-color, 0.1);
            color: $primary-color;
          }
        }
      }
    }
  }

  .modal-footer {
    padding: 20rpx 24rpx;
    border-top: 1rpx solid $bg-color;

    button {
      width: 100%;
      height: 88rpx;
    }
  }
}
</style>
