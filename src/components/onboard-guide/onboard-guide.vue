<template>
  <view v-if="visible" class="guide-overlay" @click="handleOverlayClick">
    <view class="guide-container">
      <view class="guide-header">
        <text class="guide-step">{{ currentStep + 1 }} / {{ steps.length }}</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
      </view>

      <view class="guide-content">
        <view class="step-icon">{{ steps[currentStep].icon }}</view>
        <text class="step-title">{{ steps[currentStep].title }}</text>
        <text class="step-desc">{{ steps[currentStep].desc }}</text>
      </view>

      <view class="guide-footer">
        <button 
          v-if="currentStep > 0" 
          class="btn-outline btn-sm" 
          @click="prevStep"
        >上一步</button>
        <button 
          v-if="currentStep < steps.length - 1" 
          class="btn-primary" 
          @click="nextStep"
        >下一步</button>
        <button 
          v-else 
          class="btn-primary" 
          @click="finishGuide"
        >开始使用</button>
      </view>
    </view>

    <view class="skip-btn" @click="skipGuide">跳过引导</view>
  </view>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentStep: 0,
      steps: [
        {
          icon: '🎯',
          title: '创建营销活动',
          desc: '选择模板快速创建专属活动，3分钟搞定'
        },
        {
          icon: '📤',
          title: '分享海报',
          desc: '生成精美海报，分享到微信群或朋友圈'
        },
        {
          icon: '👥',
          title: '客户管理',
          desc: '自动记录客户，打造你的私域流量池'
        }
      ]
    }
  },
  computed: {
    progressPercent() {
      return ((this.currentStep + 1) / this.steps.length) * 100
    }
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    finishGuide() {
      uni.setStorageSync('hasOnboarded', true)
      this.$emit('close')
    },
    skipGuide() {
      uni.setStorageSync('hasOnboarded', true)
      this.$emit('close')
    },
    handleOverlayClick(e) {
      if (e.target === e.currentTarget) {
        this.skipGuide()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40rpx;
}

.guide-container {
  width: 100%;
  max-width: 600rpx;
  background: #FFFFFF;
  border-radius: $radius-lg;
  overflow: hidden;
}

.guide-header {
  padding: 30rpx;
  background: linear-gradient(135deg, $primary-color, #E85D04);

  .guide-step {
    display: block;
    text-align: center;
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12rpx;
  }

  .progress-bar {
    height: 6rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: #FFFFFF;
      border-radius: 3rpx;
      transition: width 0.3s ease;
    }
  }
}

.guide-content {
  padding: 40rpx 30rpx;
  text-align: center;

  .step-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
    display: block;
  }

  .step-title {
    display: block;
    font-size: $font-size-xl;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 16rpx;
  }

  .step-desc {
    font-size: $font-size-base;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.guide-footer {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  gap: 16rpx;

  button {
    flex: 1;
  }
}

.skip-btn {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.8);
  padding: 12rpx 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 30rpx;
}
</style>