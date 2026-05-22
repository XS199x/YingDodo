<template>
  <view class="page-container">
    <view class="tab-bar">
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >进行中</view>
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >历史记录</view>
    </view>

    <view v-if="activeTab === 'active'" class="active-section">
      <view class="fab-btn" @click="createOrder">
        <text class="fab-icon">+</text>
      </view>

      <view v-if="activeOrders.length > 0" class="orders-list">
        <view v-for="order in activeOrders" :key="order.id" class="order-card card">
          <view class="order-header">
            <text class="order-title">{{ order.title }}</text>
            <view class="order-status" :class="order.status">{{ order.statusText }}</view>
          </view>

          <view class="order-desc">{{ order.desc }}</view>

          <view class="order-options">
            <view v-for="(option, index) in order.options" :key="index" class="option-item">
              <text class="option-name">{{ option.name }}</text>
              <text class="option-count">{{ option.count }}人</text>
            </view>
          </view>

          <view class="order-footer">
            <view class="order-info">
              <text class="info-item">截止时间：{{ order.endTime }}</text>
              <text class="info-item">已接龙 {{ order.totalCount }} 人</text>
            </view>
            <view class="order-actions">
              <button class="btn-outline btn-sm" @click="copyOrder(order)">复制</button>
              <button class="btn-primary btn-sm" @click="closeOrder(order)">截止</button>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-title">还没有接龙活动</text>
        <text class="empty-desc">点击右下角发起接龙</text>
      </view>
    </view>

    <view v-else class="history-section">
      <view v-if="historyOrders.length > 0" class="history-list">
        <view v-for="order in historyOrders" :key="order.id" class="history-card card">
          <view class="history-header">
            <text class="history-title">{{ order.title }}</text>
            <text class="history-status">{{ order.totalCount }}人参与</text>
          </view>
          <view class="history-info">
            <text class="history-detail">结束时间：{{ order.endTime }}</text>
            <view class="history-export" @click="exportOrder(order)">
              <text>📊 导出明细</text>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-title">暂无历史接龙</text>
      </view>
    </view>

    <view v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <view class="create-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发起接龙</text>
          <text class="modal-close" @click="showCreateModal = false">✕</text>
        </view>
        <view class="modal-content">
          <view class="form-item">
            <text class="form-label">接龙标题</text>
            <input class="form-input" v-model="orderTitle" placeholder="如：周末手工馒头预订" />
          </view>
          <view class="form-item">
            <text class="form-label">活动描述</text>
            <textarea class="form-textarea" v-model="orderDesc" placeholder="描述接龙内容..." />
          </view>
          <view class="form-item">
            <text class="form-label">接龙选项</text>
            <view class="options-list">
              <view v-for="(option, index) in options" :key="index" class="option-row">
                <input class="option-input" v-model="option.name" :placeholder="`选项${index + 1}`" />
                <text class="option-delete" @click="removeOption(index)" v-if="options.length > 1">✕</text>
              </view>
            </view>
            <button class="btn-sm btn-outline add-option-btn" @click="addOption">+ 添加选项</button>
          </view>
          <view class="form-item">
            <text class="form-label">截止时间</text>
            <view class="duration-options">
              <view 
                v-for="d in durationOptions" 
                :key="d.value" 
                class="duration-option"
                :class="{ selected: duration === d.value }"
                @click="duration = d.value"
              >{{ d.label }}</view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-primary" @click="submitOrder">发起接龙</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const activeTab = ref('active')
    const showCreateModal = ref(false)
    const orderTitle = ref('')
    const orderDesc = ref('')
    const options = ref([{ name: '' }, { name: '' }])
    const duration = ref(24)

    const durationOptions = [
      { label: '6小时', value: 6 },
      { label: '12小时', value: 12 },
      { label: '24小时', value: 24 },
      { label: '2天', value: 48 }
    ]

    const activeOrders = ref([
      {
        id: 'JO20260522001',
        title: '周末手工馒头预订',
        desc: '手工馒头，松软可口，数量有限，先到先得！',
        status: 'active',
        statusText: '进行中',
        endTime: '今天 20:00',
        totalCount: 23,
        options: [
          { name: '白面馒头 10个', count: 12 },
          { name: '杂粮馒头 10个', count: 8 },
          { name: '红糖馒头 5个', count: 3 }
        ]
      }
    ])

    const historyOrders = ref([
      { id: 'JO20260521001', title: '端午粽子预订', endTime: '2026-05-21', totalCount: 35 },
      { id: 'JO20260520001', title: '自制酸奶订购', endTime: '2026-05-20', totalCount: 18 }
    ])

    const createOrder = () => {
      showCreateModal.value = true
    }

    const addOption = () => {
      options.value.push({ name: '' })
    }

    const removeOption = (index) => {
      options.value.splice(index, 1)
    }

    const copyOrder = (order) => {
      uni.setClipboardData({
        data: `【接龙】${order.title}\n${order.desc}\n截止时间：${order.endTime}`,
        success: () => {
          uni.showToast({ title: '已复制', icon: 'success' })
        }
      })
    }

    const closeOrder = (order) => {
      uni.showModal({
        title: '截止接龙',
        content: '确定要截止此接龙吗？',
        success: (res) => {
          if (res.confirm) {
            order.status = 'closed'
            order.statusText = '已截止'
            uni.showToast({ title: '已截止', icon: 'success' })
          }
        }
      })
    }

    const exportOrder = (order) => {
      uni.showToast({ title: '已导出', icon: 'success' })
    }

    const submitOrder = () => {
      if (!orderTitle.value) {
        uni.showToast({ title: '请输入接龙标题', icon: 'none' })
        return
      }
      const validOptions = options.value.filter(o => o.name.trim())
      if (validOptions.length === 0) {
        uni.showToast({ title: '请至少添加一个选项', icon: 'none' })
        return
      }

      uni.showLoading({ title: '发起中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '接龙发起成功', icon: 'success' })
        showCreateModal.value = false
      }, 1000)
    }

    return {
      activeTab,
      showCreateModal,
      orderTitle,
      orderDesc,
      options,
      duration,
      durationOptions,
      activeOrders,
      historyOrders,
      createOrder,
      addOption,
      removeOption,
      copyOrder,
      closeOrder,
      exportOrder,
      submitOrder
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

.active-section {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  padding: 20rpx;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    .order-title {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color;
    }

    .order-status {
      font-size: $font-size-xs;
      padding: 6rpx 16rpx;
      border-radius: 12rpx;

      &.active {
        background: #E8F5E9;
        color: #2E7D32;
      }

      &.closed {
        background: #F5F5F5;
        color: $text-light;
      }
    }
  }

  .order-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: 16rpx;
  }

  .order-options {
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 12rpx;
    margin-bottom: 16rpx;

    .option-item {
      display: flex;
      justify-content: space-between;
      padding: 8rpx 12rpx;

      .option-name {
        font-size: $font-size-sm;
        color: $text-color;
      }

      .option-count {
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

    .order-info {
      .info-item {
        display: block;
        font-size: $font-size-xs;
        color: $text-light;
      }
    }

    .order-actions {
      display: flex;
      gap: 12rpx;

      button {
        padding: 0 24rpx;
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

.history-section {
  padding: 20rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-card {
  padding: 20rpx;

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    .history-title {
      font-size: $font-size-base;
      color: $text-color;
    }

    .history-status {
      font-size: $font-size-xs;
      padding: 6rpx 16rpx;
      border-radius: 12rpx;
      background: #E8F5E9;
      color: #2E7D32;
    }
  }

  .history-info {
    display: flex;
    justify-content: space-between;

    .history-detail {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    .history-export {
      font-size: $font-size-sm;
      color: $primary-color;
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
      margin-bottom: 24rpx;

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

      .form-textarea {
        width: 100%;
        height: 160rpx;
        background: $bg-color;
        border-radius: $radius-sm;
        padding: 16rpx;
        font-size: $font-size-base;
      }

      .options-list {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
        margin-bottom: 16rpx;

        .option-row {
          display: flex;
          align-items: center;

          .option-input {
            flex: 1;
            height: 72rpx;
            background: $bg-color;
            border-radius: $radius-sm;
            padding: 0 16rpx;
            font-size: $font-size-sm;
          }

          .option-delete {
            margin-left: 12rpx;
            font-size: $font-size-base;
            color: $text-light;
          }
        }
      }

      .add-option-btn {
        width: 100%;
        height: 72rpx;
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
