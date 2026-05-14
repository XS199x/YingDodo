<template>
  <view class="tag-selector">
    <view class="tag-list">
      <text
        v-for="tag in presetTags"
        :key="tag"
        class="tag"
        :class="{ 'tag-primary': selectedTags.includes(tag), 'tag-default': !selectedTags.includes(tag) }"
        @click="toggleTag(tag)"
      >{{ tag }}</text>
    </view>
    <view class="custom-tag flex-row">
      <input
        class="tag-input"
        v-model="customTag"
        placeholder="输入自定义标签"
        maxlength="10"
        @confirm="addCustomTag"
      />
      <button class="btn-sm btn-primary" @click="addCustomTag">添加</button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    value: { type: Array, default: () => [] },
    presetTags: {
      type: Array,
      default: () => ['高客单', '老客', '爱砍价', '新客', '回头客', '潜力客户']
    }
  },
  data() {
    return {
      selectedTags: [...this.value],
      customTag: ''
    }
  },
  watch: {
    value(val) {
      this.selectedTags = [...val]
    }
  },
  methods: {
    toggleTag(tag) {
      const idx = this.selectedTags.indexOf(tag)
      if (idx > -1) {
        this.selectedTags.splice(idx, 1)
      } else {
        this.selectedTags.push(tag)
      }
      this.$emit('input', this.selectedTags)
      this.$emit('change', this.selectedTags)
    },
    addCustomTag() {
      const tag = this.customTag.trim()
      if (!tag) return
      if (this.selectedTags.includes(tag)) {
        uni.showToast({ title: '标签已存在', icon: 'none' })
        return
      }
      this.selectedTags.push(tag)
      this.customTag = ''
      this.$emit('input', this.selectedTags)
      this.$emit('change', this.selectedTags)
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;

  .tag {
    margin-right: 16rpx;
    margin-bottom: 16rpx;
    padding: 10rpx 24rpx;
    border-radius: 24rpx;
    font-size: $font-size-sm;
  }
}

.custom-tag {
  .tag-input {
    flex: 1;
    height: 64rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 0 16rpx;
    font-size: $font-size-sm;
    margin-right: 16rpx;
  }

  button {
    flex-shrink: 0;
  }
}
</style>