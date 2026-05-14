<template>
  <view class="customer-item flex-between" @click="$emit('click')">
    <view class="flex-row">
      <image :src="avatar" class="avatar" mode="aspectFill" />
      <view class="info">
        <view class="name">{{ nickname }}</view>
        <view class="time">{{ time }}</view>
      </view>
    </view>
    <view class="tags">
      <text v-for="tag in displayTags" :key="tag" class="tag tag-primary">{{ tag }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    avatar: { type: String, default: '/static/images/default-avatar.png' },
    nickname: { type: String, default: '微信用户' },
    time: { type: String, default: '' },
    tags: { type: Array, default: () => [] }
  },
  computed: {
    displayTags() {
      return (this.tags || []).slice(0, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-item {
  background: $bg-white;
  border-radius: $radius-base;
  padding: 20rpx 24rpx;
  margin: 0 20rpx 12rpx;
  box-shadow: $shadow-card;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: $radius-round;
    margin-right: 20rpx;
    background: $bg-color;
  }

  .info {
    .name {
      font-size: $font-size-base;
      font-weight: 500;
      color: $text-color;
      margin-bottom: 4rpx;
    }

    .time {
      font-size: $font-size-xs;
      color: $text-light;
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 160rpx;
  }
}
</style>