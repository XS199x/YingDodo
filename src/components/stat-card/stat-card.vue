<template>
  <view class="stat-card" :class="'stat-' + type">
    <view class="stat-value">{{ value }}</view>
    <view class="stat-label">{{ label }}</view>
    <view v-if="subtitle" class="stat-subtitle">{{ subtitle }}</view>
  </view>
</template>

<script>
export default {
  props: {
    value: { type: [String, Number], default: 0 },
    label: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    type: { type: String, default: 'default' }
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  background: $bg-white;
  border-radius: $radius-base;
  padding: 24rpx;
  text-align: center;
  box-shadow: $shadow-card;

  .stat-value {
    font-size: 44rpx;
    font-weight: 700;
    margin-bottom: 8rpx;
  }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-light;
    margin-bottom: 4rpx;
  }

  .stat-subtitle {
    font-size: $font-size-xs;
    color: $text-light;
  }

  &.stat-primary .stat-value {
    color: $primary-color;
  }

  &.stat-success .stat-value {
    color: $success-color;
  }

  &.stat-warning .stat-value {
    color: $warning-color;
  }

  &.stat-danger .stat-value {
    color: $danger-color;
  }

  &.stat-default .stat-value {
    color: $text-color;
  }
}
</style>