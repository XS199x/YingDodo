<template>
  <view class="page-container">
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索商品"
          @confirm="searchProducts"
        />
      </view>
      <view class="filter-btn" @click="showFilter = true">
        <text>筛选</text>
      </view>
    </view>

    <view class="tabs-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.key" 
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <text>{{ tab.label }}</text>
        <text v-if="tab.count" class="tab-count">{{ tab.count }}</text>
      </view>
    </view>

    <view class="products-grid">
      <view v-for="product in products" :key="product.id" class="product-card card" @click="goDetail(product)">
        <view class="product-image">
          <image :src="product.image" mode="aspectFill" />
          <view v-if="product.tags.length > 0" class="product-tags">
            <text v-for="tag in product.tags" :key="tag" class="product-tag">{{ tag }}</text>
          </view>
        </view>
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <view class="product-price-row">
            <text class="product-price">¥{{ product.price }}</text>
            <text v-if="product.originalPrice" class="product-original-price">¥{{ product.originalPrice }}</text>
          </view>
          <view class="product-stock">
            <text :class="{ warning: product.stock < 10 }">库存: {{ product.stock }}件</text>
          </view>
        </view>
        <view class="product-actions">
          <view class="action-btn" @click.stop="editProduct(product)">
            <text>编辑</text>
          </view>
          <view class="action-btn primary" @click.stop="addToCart(product)">
            <text>加购</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="products.length === 0" class="empty-state">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无商品</text>
    </view>

    <view class="fab-btn" @click="goAddProduct">
      <text class="fab-icon">+</text>
    </view>

    <view v-if="showFilter" class="modal-overlay" @click="showFilter = false">
      <view class="filter-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">筛选条件</text>
          <text class="modal-close" @click="showFilter = false">✕</text>
        </view>
        <view class="modal-content">
          <view class="filter-section">
            <text class="filter-label">分类</text>
            <view class="filter-options">
              <view 
                v-for="cat in categories" 
                :key="cat" 
                class="filter-option"
                :class="{ selected: selectedCategory === cat }"
                @click="selectedCategory = cat"
              >{{ cat }}</view>
            </view>
          </view>
          <view class="filter-section">
            <text class="filter-label">价格区间</text>
            <view class="price-inputs">
              <input class="price-input" v-model="minPrice" placeholder="最低" />
              <text class="price-separator">-</text>
              <input class="price-input" v-model="maxPrice" placeholder="最高" />
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-outline" @click="resetFilter">重置</button>
          <button class="btn-primary" @click="applyFilter">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const searchKeyword = ref('')
    const activeTab = ref('all')
    const showFilter = ref(false)
    const selectedCategory = ref('全部')
    const minPrice = ref('')
    const maxPrice = ref('')

    const tabs = ref([
      { key: 'all', label: '全部', count: 24 },
      { key: 'hot', label: '热销', count: 8 },
      { key: 'new', label: '新品', count: 5 },
      { key: 'discount', label: '特价', count: 3 }
    ])

    const categories = ['全部', '水果', '零食', '饮料', '日用品', '生鲜']

    const products = ref([
      { id: 1, name: '新疆哈密瓜', price: 20, originalPrice: 28, stock: 30, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20hami%20melon%20fruit%20on%20white%20background&image_size=square', tags: ['今日特价'] },
      { id: 2, name: '进口车厘子', price: 68, originalPrice: 88, stock: 15, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20cherries%20on%20white%20background&image_size=square', tags: ['热销'] },
      { id: 3, name: '冰镇可乐 2L', price: 8, stock: 50, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cola%20bottle%20on%20white%20background&image_size=square', tags: ['新品'] },
      { id: 4, name: '有机草莓', price: 35, stock: 8, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20strawberries%20on%20white%20background&image_size=square', tags: [] },
      { id: 5, name: '云南沃柑', price: 15, originalPrice: 20, stock: 40, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20oranges%20on%20white%20background&image_size=square', tags: ['今日特价'] },
      { id: 6, name: '蒙牛纯牛奶', price: 58, stock: 25, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=milk%20box%20package%20on%20white%20background&image_size=square', tags: ['热销'] }
    ])

    const searchProducts = () => {
      console.log('搜索:', searchKeyword.value)
    }

    const goDetail = (product) => {
      uni.navigateTo({ url: `/pages/shop/order-detail?id=${product.id}` })
    }

    const editProduct = (product) => {
      uni.navigateTo({ url: `/pages/shop/add-product?id=${product.id}` })
    }

    const addToCart = (product) => {
      uni.showToast({ title: '已加入购物车', icon: 'success' })
    }

    const goAddProduct = () => {
      uni.navigateTo({ url: '/pages/shop/add-product' })
    }

    const resetFilter = () => {
      selectedCategory.value = '全部'
      minPrice.value = ''
      maxPrice.value = ''
    }

    const applyFilter = () => {
      showFilter.value = false
      uni.showToast({ title: '筛选完成', icon: 'success' })
    }

    return {
      searchKeyword,
      activeTab,
      showFilter,
      selectedCategory,
      minPrice,
      maxPrice,
      tabs,
      categories,
      products,
      searchProducts,
      goDetail,
      editProduct,
      addToCart,
      goAddProduct,
      resetFilter,
      applyFilter
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  gap: 16rpx;
  padding: 20rpx;

  .search-input-wrap {
    flex: 1;
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

  .filter-btn {
    padding: 0 24rpx;
    height: 80rpx;
    background: $bg-color;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.tabs-bar {
  display: flex;
  padding: 0 20rpx;
  gap: 16rpx;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    display: flex;
    align-items: center;
    padding: 12rpx 24rpx;
    background: $bg-color;
    border-radius: 30rpx;
    font-size: $font-size-sm;
    color: $text-secondary;
    white-space: nowrap;

    &.active {
      background: $primary-color;
      color: #FFFFFF;
    }

    .tab-count {
      margin-left: 8rpx;
      padding: 2rpx 8rpx;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10rpx;
      font-size: $font-size-xs;
    }
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 20rpx;
}

.product-card {
  overflow: hidden;

  .product-image {
    position: relative;
    width: 100%;
    height: 200rpx;

    image {
      width: 100%;
      height: 100%;
    }

    .product-tags {
      position: absolute;
      top: 12rpx;
      left: 12rpx;
      display: flex;
      gap: 8rpx;

      .product-tag {
        padding: 4rpx 12rpx;
        background: rgba(255, 107, 53, 0.9);
        color: #FFFFFF;
        font-size: 20rpx;
        border-radius: 8rpx;
      }
    }
  }

  .product-info {
    padding: 16rpx;

    .product-name {
      display: block;
      font-size: $font-size-sm;
      color: $text-color;
      margin-bottom: 8rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-price-row {
      display: flex;
      align-items: baseline;
      gap: 8rpx;
      margin-bottom: 8rpx;

      .product-price {
        font-size: $font-size-lg;
        font-weight: 600;
        color: $primary-color;
      }

      .product-original-price {
        font-size: $font-size-xs;
        color: $text-light;
        text-decoration: line-through;
      }
    }

    .product-stock {
      font-size: $font-size-xs;
      color: $text-secondary;

      &.warning {
        color: #FF4757;
      }
    }
  }

  .product-actions {
    display: flex;
    border-top: 1rpx solid $bg-color;

    .action-btn {
      flex: 1;
      padding: 16rpx;
      text-align: center;
      font-size: $font-size-sm;
      color: $text-secondary;

      &.primary {
        color: $primary-color;
      }

      &:active {
        opacity: 0.6;
      }
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
  z-index: 100;

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

    .filter-section {
      margin-bottom: 24rpx;

      .filter-label {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: 16rpx;
      }

      .filter-options {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .filter-option {
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

      .price-inputs {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .price-input {
          flex: 1;
          height: 72rpx;
          background: $bg-color;
          border-radius: $radius-sm;
          padding: 0 16rpx;
          font-size: $font-size-sm;
        }

        .price-separator {
          font-size: $font-size-base;
          color: $text-light;
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    border-top: 1rpx solid $bg-color;

    button {
      flex: 1;
    }
  }
}
</style>
