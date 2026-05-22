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
      <view class="fab-btn" @click="createGroupBuy">
        <text class="fab-icon">+</text>
      </view>

      <view v-if="activeGroups.length > 0" class="groups-list">
        <view v-for="group in activeGroups" :key="group.id" class="group-card card">
          <view class="group-header">
            <image :src="group.product.image" class="group-image" mode="aspectFill" />
            <view class="group-info">
              <text class="group-title">{{ group.product.name }}</text>
              <view class="group-price">
                <text class="price-current">¥{{ group.groupPrice }}</text>
                <text class="price-original">¥{{ group.originalPrice }}</text>
              </view>
            </view>
          </view>

          <view class="group-progress">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: group.progressPercent + '%' }"></view>
            </view>
            <text class="progress-text">{{ group.currentCount }}/{{ group.minCount }}人成团</text>
          </view>

          <view class="group-stats">
            <view class="stat-item">
              <text class="stat-value">{{ group.totalSales }}</text>
              <text class="stat-label">已售</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ group.shareCount }}</text>
              <text class="stat-label">分享</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ formatTime(group.endTime) }}</text>
              <text class="stat-label">剩余时间</text>
            </view>
          </view>

          <view class="group-actions">
            <button class="btn-outline btn-sm" @click="copyLink(group)">复制链接</button>
            <button class="btn-primary btn-sm" @click="shareGroup(group)">分享到群</button>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-title">还没有拼团活动</text>
        <text class="empty-desc">点击右下角按钮发起拼团</text>
      </view>
    </view>

    <view v-else class="history-section">
      <view v-if="historyGroups.length > 0" class="history-list">
        <view v-for="group in historyGroups" :key="group.id" class="history-card card">
          <view class="history-header">
            <text class="history-title">{{ group.product.name }}</text>
            <text class="history-status" :class="group.status">{{ group.statusText }}</text>
          </view>
          <view class="history-info">
            <text class="history-detail">成团人数：{{ group.currentCount }}/{{ group.minCount }}</text>
            <text class="history-detail">销售额：¥{{ group.totalSales }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-title">暂无历史记录</text>
      </view>
    </view>

    <view v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <view class="create-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发起拼团</text>
          <text class="modal-close" @click="showCreateModal = false">✕</text>
        </view>
        <view class="modal-content">
          <view class="form-item">
            <text class="form-label">选择商品</text>
            <view class="product-select" @click="showProductPicker = true">
              <text>{{ selectedProduct || '请选择商品' }}</text>
              <text class="arrow">›</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">拼团价格</text>
            <view class="price-input-wrap">
              <text class="price-symbol">¥</text>
              <input class="price-input" v-model="groupPrice" type="digit" placeholder="0.00" />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">成团人数</text>
            <view class="count-input-wrap">
              <view class="count-btn" @click="decreaseCount">-</view>
              <input class="count-input" v-model="minCount" type="number" />
              <view class="count-btn" @click="increaseCount">+</view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">活动时长</text>
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
          <button class="btn-primary" @click="submitGroupBuy">发起拼团</button>
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
    const showProductPicker = ref(false)
    const selectedProduct = ref('')
    const groupPrice = ref('')
    const minCount = ref(3)
    const duration = ref(24)

    const durationOptions = [
      { label: '12小时', value: 12 },
      { label: '24小时', value: 24 },
      { label: '3天', value: 72 },
      { label: '7天', value: 168 }
    ]

    const activeGroups = ref([
      {
        id: 'GT20260522001',
        product: { name: '新疆哈密瓜2个装', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=hami%20melon&image_size=square' },
        groupPrice: 35,
        originalPrice: 48,
        currentCount: 2,
        minCount: 3,
        progressPercent: 66,
        totalSales: 7,
        shareCount: 15,
        endTime: Date.now() + 3600000 * 18
      }
    ])

    const historyGroups = ref([
      {
        id: 'GT20260521001',
        product: { name: '进口车厘子1斤装' },
        currentCount: 5,
        minCount: 3,
        totalSales: 280,
        status: 'success',
        statusText: '已成功'
      },
      {
        id: 'GT20260520001',
        product: { name: '有机草莓2盒' },
        currentCount: 1,
        minCount: 3,
        totalSales: 0,
        status: 'failed',
        statusText: '未成团'
      }
    ])

    const formatTime = (timestamp) => {
      const remaining = timestamp - Date.now()
      if (remaining <= 0) return '已结束'
      const hours = Math.floor(remaining / 3600000)
      const minutes = Math.floor((remaining % 3600000) / 60000)
      return `${hours}小时${minutes}分钟`
    }

    const createGroupBuy = () => {
      showCreateModal.value = true
    }

    const decreaseCount = () => {
      if (minCount.value > 2) minCount.value--
    }

    const increaseCount = () => {
      if (minCount.value < 10) minCount.value++
    }

    const copyLink = (group) => {
      uni.setClipboardData({
        data: `快来参加拼团！${group.product.name} 仅需¥${group.groupPrice}`,
        success: () => {
          uni.showToast({ title: '链接已复制', icon: 'success' })
        }
      })
    }

    const shareGroup = (group) => {
      uni.showToast({ title: '请分享到微信群', icon: 'none' })
    }

    const submitGroupBuy = () => {
      if (!selectedProduct.value) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return
      }
      if (!groupPrice.value) {
        uni.showToast({ title: '请输入拼团价格', icon: 'none' })
        return
      }

      uni.showLoading({ title: '发起中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '拼团发起成功', icon: 'success' })
        showCreateModal.value = false
      }, 1000)
    }

    return {
      activeTab,
      showCreateModal,
      showProductPicker,
      selectedProduct,
      groupPrice,
      minCount,
      duration,
      durationOptions,
      activeGroups,
      historyGroups,
      formatTime,
      createGroupBuy,
      decreaseCount,
      increaseCount,
      copyLink,
      shareGroup,
      submitGroupBuy
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

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.group-card {
  padding: 20rpx;

  .group-header {
    display: flex;
    margin-bottom: 20rpx;

    .group-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: $radius-sm;
      margin-right: 16rpx;
    }

    .group-info {
      flex: 1;

      .group-title {
        display: block;
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 12rpx;
      }

      .group-price {
        display: flex;
        align-items: baseline;
        gap: 8rpx;

        .price-current {
          font-size: $font-size-xl;
          font-weight: 600;
          color: $primary-color;
        }

        .price-original {
          font-size: $font-size-sm;
          color: $text-light;
          text-decoration: line-through;
        }
      }
    }
  }

  .group-progress {
    margin-bottom: 20rpx;

    .progress-bar {
      height: 12rpx;
      background: $bg-color;
      border-radius: 6rpx;
      overflow: hidden;
      margin-bottom: 8rpx;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, $primary-color, #FF8A5B);
        border-radius: 6rpx;
        transition: width 0.3s ease;
      }
    }

    .progress-text {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }

  .group-stats {
    display: flex;
    justify-content: space-around;
    padding: 16rpx 0;
    border-top: 1rpx solid $bg-color;
    border-bottom: 1rpx solid $bg-color;
    margin-bottom: 20rpx;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .stat-label {
        font-size: $font-size-xs;
        color: $text-light;
      }
    }
  }

  .group-actions {
    display: flex;
    gap: 16rpx;

    button {
      flex: 1;
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
      padding: 4rpx 12rpx;
      border-radius: 12rpx;

      &.success {
        background: #E8F5E9;
        color: #2E7D32;
      }

      &.failed {
        background: #FCE4EC;
        color: #C2185B;
      }
    }
  }

  .history-info {
    display: flex;
    gap: 24rpx;

    .history-detail {
      font-size: $font-size-sm;
      color: $text-secondary;
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
  max-height: 80vh;
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

      .product-select {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 80rpx;
        background: $bg-color;
        border-radius: $radius-sm;
        padding: 0 20rpx;
        font-size: $font-size-base;
        color: $text-color;

        .arrow {
          color: $text-light;
        }
      }

      .price-input-wrap {
        display: flex;
        align-items: center;
        height: 80rpx;
        background: $bg-color;
        border-radius: $radius-sm;
        padding: 0 20rpx;

        .price-symbol {
          font-size: $font-size-lg;
          color: $primary-color;
          font-weight: 600;
        }

        .price-input {
          flex: 1;
          background: transparent;
          padding: 0;
          margin-left: 8rpx;
          font-size: $font-size-base;
        }
      }

      .count-input-wrap {
        display: flex;
        align-items: center;

        .count-btn {
          width: 80rpx;
          height: 80rpx;
          background: $bg-color;
          border-radius: $radius-sm 0 0 $radius-sm;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: $font-size-xl;
          color: $text-secondary;
        }

        .count-input {
          flex: 1;
          height: 80rpx;
          background: $bg-color;
          padding: 0;
          text-align: center;
          font-size: $font-size-base;
          border-left: 1rpx solid #E8E8E8;
          border-right: 1rpx solid #E8E8E8;
        }

        .count-btn:last-child {
          border-radius: 0 $radius-sm $radius-sm 0;
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
