<template>
  <view class="page-container">
    <view class="tab-bar">
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'plans' }"
        @click="activeTab = 'plans'"
      >订阅计划</view>
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'subscribers' }"
        @click="activeTab = 'subscribers'"
      >订阅客户</view>
    </view>

    <view v-if="activeTab === 'plans'" class="plans-section">
      <view class="fab-btn" @click="createPlan">
        <text class="fab-icon">+</text>
      </view>

      <view v-if="plans.length > 0" class="plans-list">
        <view v-for="plan in plans" :key="plan.id" class="plan-card card">
          <view class="plan-header">
            <view class="plan-icon">{{ plan.icon }}</view>
            <view class="plan-info">
              <text class="plan-name">{{ plan.name }}</text>
              <text class="plan-desc">{{ plan.desc }}</text>
            </view>
          </view>

          <view class="plan-details">
            <view class="detail-row">
              <text class="detail-label">价格</text>
              <text class="detail-value price">¥{{ plan.price }}/{{ plan.period }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">配送时间</text>
              <text class="detail-value">{{ plan.deliveryTime }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">订阅人数</text>
              <text class="detail-value">{{ plan.subscriberCount }}人</text>
            </view>
          </view>

          <view class="plan-footer">
            <view class="plan-status" :class="plan.status">
              {{ plan.statusText }}
            </view>
            <view class="plan-actions">
              <text class="action-text" @click="editPlan(plan)">编辑</text>
              <text class="action-text" @click="copyPlanLink(plan)">分享</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">🔄</text>
        <text class="empty-title">还没有订阅计划</text>
        <text class="empty-desc">点击右下角创建周期购计划</text>
      </view>
    </view>

    <view v-else class="subscribers-section">
      <view class="search-bar">
        <view class="search-input-wrap">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索客户"
          />
        </view>
      </view>

      <view v-if="subscribers.length > 0" class="subscribers-list">
        <view v-for="sub in subscribers" :key="sub.id" class="subscriber-card card">
          <view class="subscriber-header">
            <image :src="sub.avatar" class="subscriber-avatar" mode="aspectFill" />
            <view class="subscriber-info">
              <text class="subscriber-name">{{ sub.name }}</text>
              <text class="subscriber-plan">{{ sub.planName }}</text>
            </view>
            <view class="subscriber-status" :class="sub.status">{{ sub.statusText }}</view>
          </view>
          <view class="subscriber-footer">
            <text class="next-delivery">下次配送：{{ sub.nextDelivery }}</text>
            <text class="delivery-count">已配送 {{ sub.deliveryCount }} 次</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-title">暂无订阅客户</text>
      </view>
    </view>

    <view v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <view class="create-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">创建订阅计划</text>
          <text class="modal-close" @click="showCreateModal = false">✕</text>
        </view>
        <view class="modal-content">
          <view class="form-item">
            <text class="form-label">计划名称</text>
            <input class="form-input" v-model="planName" placeholder="如：每日鲜奶月卡" />
          </view>
          <view class="form-item">
            <text class="form-label">计划描述</text>
            <input class="form-input" v-model="planDesc" placeholder="简短描述计划内容" />
          </view>
          <view class="form-item">
            <text class="form-label">计划图标</text>
            <view class="icon-picker">
              <view 
                v-for="icon in iconOptions" 
                :key="icon" 
                class="icon-item"
                :class="{ selected: selectedIcon === icon }"
                @click="selectedIcon = icon"
              >{{ icon }}</view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">价格</text>
            <view class="price-input-wrap">
              <text class="price-symbol">¥</text>
              <input class="price-input" v-model="planPrice" type="digit" placeholder="0.00" />
              <view class="period-select">
                <text>{{ planPeriod }}</text>
                <text class="arrow">›</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">配送周期</text>
            <view class="period-options">
              <view 
                v-for="p in periodOptions" 
                :key="p.value" 
                class="period-option"
                :class="{ selected: deliveryPeriod === p.value }"
                @click="deliveryPeriod = p.value"
              >{{ p.label }}</view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">配送时间</text>
            <input class="form-input" v-model="deliveryTime" placeholder="如：每天早上8:00" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-primary" @click="submitPlan">创建计划</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const activeTab = ref('plans')
    const searchKeyword = ref('')
    const showCreateModal = ref(false)
    const planName = ref('')
    const planDesc = ref('')
    const selectedIcon = ref('🥛')
    const planPrice = ref('')
    const planPeriod = ref('月')
    const deliveryPeriod = ref('daily')
    const deliveryTime = ref('')

    const iconOptions = ['🥛', '🌸', '🍖', '🍞', '🥚', '🍊', '☕️', '🍦']
    const periodOptions = [
      { label: '每日', value: 'daily' },
      { label: '每周', value: 'weekly' },
      { label: '每月', value: 'monthly' }
    ]

    const plans = ref([
      {
        id: 'SP20260501',
        name: '每日鲜奶月卡',
        desc: '每天一瓶新鲜牛奶，送到家门口',
        icon: '🥛',
        price: 188,
        period: '月',
        deliveryTime: '每天早上8:00-9:00',
        subscriberCount: 28,
        status: 'active',
        statusText: '进行中'
      },
      {
        id: 'SP20260502',
        name: '每周一花',
        desc: '精选鲜花，每周一束送到家',
        icon: '🌸',
        price: 99,
        period: '周',
        deliveryTime: '每周三下午',
        subscriberCount: 15,
        status: 'active',
        statusText: '进行中'
      }
    ])

    const subscribers = ref([
      { id: 1, name: '王女士', avatar: '', planName: '每日鲜奶月卡', status: 'active', statusText: '订阅中', nextDelivery: '明天 08:00', deliveryCount: 12 },
      { id: 2, name: '李阿姨', avatar: '', planName: '每日鲜奶月卡', status: 'active', statusText: '订阅中', nextDelivery: '明天 08:00', deliveryCount: 28 },
      { id: 3, name: '张先生', avatar: '', planName: '每周一花', status: 'paused', statusText: '暂停', nextDelivery: '周三 14:00', deliveryCount: 4 },
      { id: 4, name: '刘姐', avatar: '', planName: '每日鲜奶月卡', status: 'active', statusText: '订阅中', nextDelivery: '明天 08:00', deliveryCount: 8 }
    ])

    const createPlan = () => {
      showCreateModal.value = true
    }

    const editPlan = (plan) => {
      uni.showToast({ title: '编辑计划', icon: 'none' })
    }

    const copyPlanLink = (plan) => {
      uni.setClipboardData({
        data: `订阅「${plan.name}」，仅需¥${plan.price}/${plan.period}`,
        success: () => {
          uni.showToast({ title: '链接已复制', icon: 'success' })
        }
      })
    }

    const submitPlan = () => {
      if (!planName.value) {
        uni.showToast({ title: '请输入计划名称', icon: 'none' })
        return
      }
      if (!planPrice.value) {
        uni.showToast({ title: '请输入价格', icon: 'none' })
        return
      }

      uni.showLoading({ title: '创建中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '计划创建成功', icon: 'success' })
        showCreateModal.value = false
      }, 1000)
    }

    return {
      activeTab,
      searchKeyword,
      showCreateModal,
      planName,
      planDesc,
      selectedIcon,
      planPrice,
      planPeriod,
      deliveryPeriod,
      deliveryTime,
      iconOptions,
      periodOptions,
      plans,
      subscribers,
      createPlan,
      editPlan,
      copyPlanLink,
      submitPlan
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

.plans-section {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.plan-card {
  padding: 20rpx;

  .plan-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .plan-icon {
      width: 64rpx;
      height: 64rpx;
      background: rgba($primary-color, 0.1);
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-right: 16rpx;
    }

    .plan-info {
      flex: 1;

      .plan-name {
        display: block;
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .plan-desc {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }
  }

  .plan-details {
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 16rpx;
    margin-bottom: 16rpx;

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8rpx 0;

      .detail-label {
        font-size: $font-size-sm;
        color: $text-secondary;
      }

      .detail-value {
        font-size: $font-size-sm;
        color: $text-color;

        &.price {
          font-size: $font-size-lg;
          font-weight: 600;
          color: $primary-color;
        }
      }
    }
  }

  .plan-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .plan-status {
      font-size: $font-size-xs;
      padding: 6rpx 16rpx;
      border-radius: 12rpx;

      &.active {
        background: #E8F5E9;
        color: #2E7D32;
      }

      &.paused {
        background: #FFF5F0;
        color: $primary-color;
      }
    }

    .plan-actions {
      display: flex;
      gap: 24rpx;

      .action-text {
        font-size: $font-size-sm;
        color: $primary-color;
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

.subscribers-section {
  padding: 20rpx;
}

.search-bar {
  margin-bottom: 20rpx;

  .search-input-wrap {
    display: flex;
    align-items: center;
    background: $bg-color;
    border-radius: $radius-lg;
    padding: 0 20rpx;

    .search-icon {
      font-size: $font-size-lg;
      margin-right: 12rpx;
    }

    .search-input {
      flex: 1;
      height: 80rpx;
      font-size: $font-size-base;
    }
  }
}

.subscribers-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.subscriber-card {
  padding: 20rpx;

  .subscriber-header {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    .subscriber-avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: $radius-round;
      background: $bg-color;
      margin-right: 16rpx;
    }

    .subscriber-info {
      flex: 1;

      .subscriber-name {
        display: block;
        font-size: $font-size-base;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .subscriber-plan {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .subscriber-status {
      font-size: $font-size-xs;
      padding: 6rpx 16rpx;
      border-radius: 12rpx;

      &.active {
        background: #E8F5E9;
        color: #2E7D32;
      }

      &.paused {
        background: #FFF5F0;
        color: $primary-color;
      }
    }
  }

  .subscriber-footer {
    display: flex;
    justify-content: space-between;

    .next-delivery,
    .delivery-count {
      font-size: $font-size-xs;
      color: $text-light;
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

      .form-input {
        width: 100%;
        height: 80rpx;
        background: $bg-color;
        border-radius: $radius-sm;
        padding: 0 20rpx;
        font-size: $font-size-base;
      }

      .icon-picker {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .icon-item {
          width: 72rpx;
          height: 72rpx;
          background: $bg-color;
          border-radius: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;

          &.selected {
            background: rgba($primary-color, 0.1);
            border: 2rpx solid $primary-color;
          }
        }
      }

      .price-input-wrap {
        display: flex;
        align-items: center;

        .price-symbol {
          font-size: $font-size-lg;
          color: $primary-color;
          font-weight: 600;
          margin-right: 8rpx;
        }

        .price-input {
          flex: 1;
          height: 80rpx;
          background: $bg-color;
          border-radius: $radius-sm 0 0 $radius-sm;
          padding: 0 20rpx;
          font-size: $font-size-base;
        }

        .period-select {
          display: flex;
          align-items: center;
          padding: 0 20rpx;
          height: 80rpx;
          background: $bg-color;
          border-radius: 0 $radius-sm $radius-sm 0;
          font-size: $font-size-base;
          color: $text-secondary;
          border-left: 1rpx solid #E8E8E8;

          .arrow {
            margin-left: 8rpx;
            color: $text-light;
          }
        }
      }

      .period-options {
        display: flex;
        gap: 12rpx;

        .period-option {
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
