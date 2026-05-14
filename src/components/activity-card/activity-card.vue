<template>
  <view class="activity-card" :style="{ borderLeftColor: color }" @click="$emit('click')">
    <view class="card-icon">{{ icon }}</view>
    <view class="card-content">
      <view class="card-name">{{ name }}</view>
      <view class="card-desc">{{ desc }}</view>
    </view>
    <view class="card-arrow">›</view>
  </view>
</template>

<script>
export default {
  props: {
    name: { type: String, default: '' },
    desc: { type: String, default: '' },
    icon: { type: String, default: '📋' },
    color: { type: String, default: '#FF6B35' }
  }
}
</script>

<style lang="scss" scoped>
.activity-card {
  display: flex;
  align-items: center;
  background: $bg-white;
  border-radius: $radius-base;
  padding: 24rpx;
  margin: 0 20rpx 16rpx;
  border-left: 6rpx solid;
  box-shadow: $shadow-card;

  .card-icon {
    font-size: 44rpx;
    margin-right: 20rpx;
  }

  .card-content {
    flex: 1;

    .card-name {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 6rpx;
    }

    .card-desc {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }

  .card-arrow {
    font-size: 36rpx;
    color: $text-light;
  }
}
</style>