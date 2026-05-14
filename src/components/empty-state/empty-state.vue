<template>
  <view class="empty-state flex-center">
    <view class="empty-icon">📭</view>
    <view class="empty-text">{{ text }}</view>
    <view v-if="subtext" class="empty-subtext">{{ subtext }}</view>
  </view>
</template>

<script>
export default {
  props: {
    text: { type: String, default: '暂无数据' },
    subtext: { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.empty-state {
  flex-direction: column;
  padding: 80rpx 40rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: 8rpx;
  }

  .empty-subtext {
    font-size: $font-size-sm;
    color: $text-light;
    text-align: center;
    line-height: 1.6;
  }
}
</style>