<template>
  <view class="poster-canvas-wrap">
    <canvas
      canvas-id="posterCanvas"
      class="poster-canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    />
    <image
      v-if="imageUrl"
      :src="imageUrl"
      class="poster-image"
      mode="widthFix"
      show-menu-by-longpress
    />
  </view>
</template>

<script>
export default {
  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 500 },
    imageUrl: { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.poster-canvas-wrap {
  display: flex;
  justify-content: center;
  padding: 20rpx;
}

.poster-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}

.poster-image {
  width: 600rpx;
  border-radius: $radius-base;
  box-shadow: $shadow-float;
}
</style>