<template>
  <view class="page-container">
    <view class="product-header">
      <image :src="product.image" class="product-image" mode="aspectFill" />
      <view class="header-actions">
        <view class="action-btn" @click="goBack">
          <text>‹</text>
        </view>
      </view>
    </view>

    <view class="product-info card">
      <view class="product-tags">
        <text v-for="tag in product.tags" :key="tag" class="product-tag">{{ tag }}</text>
      </view>
      <text class="product-name">{{ product.name }}</text>
      <view class="product-price-row">
        <text class="product-price">¥{{ product.price }}</text>
        <text v-if="product.originalPrice" class="product-original-price">¥{{ product.originalPrice }}</text>
      </view>
      <text class="product-desc">{{ product.desc }}</text>
    </view>

    <view class="stock-info card">
      <view class="stock-row">
        <text class="stock-label">库存</text>
        <text class="stock-value" :class="{ warning: product.stock < 10 }">{{ product.stock }}件</text>
      </view>
      <view class="stock-row">
        <text class="stock-label">销量</text>
        <text class="stock-value">{{ product.sales }}件</text>
      </view>
    </view>

    <view class="actions-section">
      <button class="btn-outline" @click="editProduct">编辑商品</button>
      <button class="btn-primary" @click="addToCart">加入购物车</button>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const product = ref({
      id: 1,
      name: '新疆哈密瓜',
      price: 20,
      originalPrice: 25,
      desc: '来自新疆的优质哈密瓜，甜度高，口感细腻',
      stock: 15,
      sales: 128,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=hami%20melon&image_size=square',
      tags: ['今日特价', '新到货']
    })

    const goBack = () => {
      uni.navigateBack()
    }

    const editProduct = () => {
      uni.showToast({ title: '编辑商品', icon: 'none' })
    }

    const addToCart = () => {
      uni.showToast({ title: '已加入购物车', icon: 'success' })
    }

    return {
      product,
      goBack,
      editProduct,
      addToCart
    }
  }
}
</script>

<style lang="scss" scoped>
.product-header {
  position: relative;
  height: 500rpx;

  .product-image {
    width: 100%;
    height: 100%;
  }

  .header-actions {
    position: absolute;
    top: 60rpx;
    left: 20rpx;

    .action-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(0, 0, 0, 0.5);
      border-radius: $radius-round;
      display: flex;
      align-items: center;
      justify-content: center;

      text {
        font-size: $font-size-xl;
        color: #FFFFFF;
      }
    }
  }
}

.product-info {
  margin: -40rpx 20rpx 20rpx;
  padding: 24rpx;
  position: relative;
  z-index: 10;

  .product-tags {
    display: flex;
    gap: 8rpx;
    margin-bottom: 12rpx;

    .product-tag {
      padding: 4rpx 12rpx;
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      font-size: $font-size-xs;
      border-radius: 8rpx;
    }
  }

  .product-name {
    display: block;
    font-size: $font-size-xl;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 12rpx;
  }

  .product-price-row {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
    margin-bottom: 12rpx;

    .product-price {
      font-size: $font-size-xxl;
      font-weight: 600;
      color: $primary-color;
    }

    .product-original-price {
      font-size: $font-size-base;
      color: $text-light;
      text-decoration: line-through;
    }
  }

  .product-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.stock-info {
  margin: 0 20rpx 20rpx;
  padding: 20rpx;

  .stock-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .stock-label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    .stock-value {
      font-size: $font-size-sm;
      color: $text-color;
      font-weight: 500;

      &.warning {
        color: #FF4757;
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
