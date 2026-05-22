<template>
  <view class="page-container">
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value warning">{{ lowStockCount }}</text>
        <text class="stat-label">库存预警</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ totalProducts }}</text>
        <text class="stat-label">商品总数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ alertCount }}</text>
        <text class="stat-label">待补货</text>
      </view>
    </view>

    <view class="alert-section">
      <view class="section-card card">
        <view class="section-header flex-between">
          <text class="section-title">⚠️ 库存预警</text>
          <text class="section-more">查看全部 →</text>
        </view>
        <view class="alert-list">
          <view v-for="item in lowStockItems" :key="item.id" class="alert-item">
            <image :src="item.image" class="alert-image" mode="aspectFill" />
            <view class="alert-info">
              <text class="alert-name">{{ item.name }}</text>
              <text class="alert-stock">库存：{{ item.stock }}件</text>
            </view>
            <button class="btn-outline btn-sm" @click="restockItem(item)">补货</button>
          </view>
        </view>
      </view>
    </view>

    <view class="inventory-section">
      <view class="section-card card">
        <view class="section-header flex-between">
          <text class="section-title">库存列表</text>
          <view class="filter-select" @click="showFilter = true">
            <text>{{ currentFilter }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        <view class="inventory-list">
          <view v-for="item in inventoryItems" :key="item.id" class="inventory-item">
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-category">{{ item.category }}</text>
            </view>
            <view class="item-stock" :class="getStockClass(item.stock, item.minStock)">
              <text>{{ item.stock }}</text>
              <text class="stock-unit">件</text>
            </view>
            <view class="item-action">
              <text class="action-text" @click="editItem(item)">编辑</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="tips-section">
      <view class="tips-card card">
        <text class="tips-icon">💡</text>
        <view class="tips-content">
          <text class="tips-title">库存管理建议</text>
          <text class="tips-desc">建议设置合理的库存预警值，当库存低于预警值时系统会自动提醒您补货。</text>
        </view>
      </view>
    </view>

    <view v-if="showFilter" class="modal-overlay" @click="showFilter = false">
      <view class="filter-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">筛选条件</text>
          <text class="modal-close" @click="showFilter = false">✕</text>
        </view>
        <view class="modal-content">
          <view class="filter-options">
            <view 
              v-for="filter in filters" 
              :key="filter.value" 
              class="filter-option"
              :class="{ selected: currentFilter === filter.label }"
              @click="selectFilter(filter)"
            >{{ filter.label }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const showFilter = ref(false)
    const currentFilter = ref('全部')

    const filters = [
      { label: '全部', value: 'all' },
      { label: '库存充足', value: 'plenty' },
      { label: '库存偏低', value: 'low' },
      { label: '需要补货', value: 'alert' }
    ]

    const lowStockCount = ref(3)
    const totalProducts = ref(24)
    const alertCount = ref(3)

    const lowStockItems = ref([
      { id: 1, name: '有机草莓', stock: 5, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=strawberries&image_size=square' },
      { id: 2, name: '进口蓝莓', stock: 3, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=blueberries&image_size=square' },
      { id: 3, name: '新疆哈密瓜', stock: 8, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=hami%20melon&image_size=square' }
    ])

    const inventoryItems = ref([
      { id: 1, name: '新疆哈密瓜', category: '水果', stock: 8, minStock: 10 },
      { id: 2, name: '进口车厘子', category: '水果', stock: 15, minStock: 10 },
      { id: 3, name: '有机草莓', category: '水果', stock: 5, minStock: 10 },
      { id: 4, name: '冰镇可乐', category: '饮料', stock: 50, minStock: 20 },
      { id: 5, name: '蒙牛纯牛奶', category: '饮料', stock: 25, minStock: 15 },
      { id: 6, name: '进口蓝莓', category: '水果', stock: 3, minStock: 10 },
      { id: 7, name: '云南沃柑', category: '水果', stock: 40, minStock: 20 },
      { id: 8, name: '新鲜鸡蛋', category: '生鲜', stock: 100, minStock: 50 }
    ])

    const getStockClass = (stock, minStock) => {
      if (stock <= minStock) return 'alert'
      if (stock <= minStock * 1.5) return 'low'
      return 'normal'
    }

    const restockItem = (item) => {
      uni.showModal({
        title: '补货',
        content: `确认给「${item.name}」补货吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '已标记需补货', icon: 'success' })
          }
        }
      })
    }

    const editItem = (item) => {
      uni.showToast({ title: '编辑库存', icon: 'none' })
    }

    const selectFilter = (filter) => {
      currentFilter.value = filter.label
      showFilter.value = false
    }

    return {
      showFilter,
      currentFilter,
      filters,
      lowStockCount,
      totalProducts,
      alertCount,
      lowStockItems,
      inventoryItems,
      getStockClass,
      restockItem,
      editItem,
      selectFilter
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  background: $bg-white;
  margin-bottom: 20rpx;

  .stat-item {
    text-align: center;

    .stat-value {
      display: block;
      font-size: $font-size-xl;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 8rpx;

      &.warning {
        color: #FF4757;
      }
    }

    .stat-label {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }

  .stat-divider {
    width: 1rpx;
    background: $bg-color;
  }
}

.alert-section,
.inventory-section,
.tips-section {
  padding: 0 20rpx 20rpx;
}

.section-card {
  padding: 20rpx;

  .section-header {
    margin-bottom: 16rpx;

    .section-title {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color;
    }

    .section-more {
      font-size: $font-size-sm;
      color: $primary-color;
    }

    .filter-select {
      display: flex;
      align-items: center;
      padding: 8rpx 16rpx;
      background: $bg-color;
      border-radius: 20rpx;
      font-size: $font-size-sm;
      color: $text-secondary;

      .arrow {
        margin-left: 8rpx;
      }
    }
  }
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .alert-item {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background: #FFF5F0;
    border-radius: $radius-sm;

    .alert-image {
      width: 80rpx;
      height: 80rpx;
      border-radius: $radius-sm;
      margin-right: 16rpx;
    }

    .alert-info {
      flex: 1;

      .alert-name {
        display: block;
        font-size: $font-size-sm;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .alert-stock {
        font-size: $font-size-xs;
        color: #FF4757;
      }
    }

    button {
      padding: 8rpx 20rpx;
    }
  }
}

.inventory-list {
  .inventory-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .item-info {
      flex: 1;

      .item-name {
        display: block;
        font-size: $font-size-base;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .item-category {
        font-size: $font-size-xs;
        color: $text-light;
      }
    }

    .item-stock {
      display: flex;
      align-items: baseline;
      margin-right: 20rpx;

      text {
        font-size: $font-size-lg;
        font-weight: 600;
        color: #2E7D32;
      }

      .stock-unit {
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-left: 4rpx;
      }

      &.low {
        text {
          color: $primary-color;
        }
      }

      &.alert {
        text {
          color: #FF4757;
        }
      }
    }

    .item-action {
      .action-text {
        font-size: $font-size-sm;
        color: $primary-color;
      }
    }
  }
}

.tips-card {
  display: flex;
  padding: 20rpx;
  background: linear-gradient(135deg, #FFF5F0, #FFFFFF);

  .tips-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
  }

  .tips-content {
    flex: 1;

    .tips-title {
      display: block;
      font-size: $font-size-sm;
      font-weight: 500;
      color: $text-color;
      margin-bottom: 4rpx;
    }

    .tips-desc {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
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

.filter-modal {
  width: 100%;
  background: $bg-white;
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: $safe-bottom-env;

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

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .filter-option {
        padding: 16rpx 24rpx;
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
</style>
