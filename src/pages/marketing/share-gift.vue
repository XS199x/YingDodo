<template>
  <view class="page-container">
    <view class="banner-section">
      <view class="banner-card card">
        <view class="banner-icon">🎁</view>
        <view class="banner-content">
          <text class="banner-title">老带新 · 分享有礼</text>
          <text class="banner-desc">分享给邻居，两人各得3元券</text>
        </view>
      </view>
    </view>

    <view class="stats-section">
      <view class="stats-card card">
        <view class="stat-item">
          <text class="stat-value">{{ totalShares }}</text>
          <text class="stat-label">总分享次数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ newCustomers }}</text>
          <text class="stat-label">新增客户</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">¥{{ totalBonus }}</text>
          <text class="stat-label">发放奖励</text>
        </view>
      </view>
    </view>

    <view class="rules-section">
      <view class="section-card card">
        <text class="section-title">活动规则</text>
        <view class="rules-list">
          <view class="rule-item">
            <text class="rule-num">1</text>
            <text class="rule-text">老顾客分享小程序给同小区邻居</text>
          </view>
          <view class="rule-item">
            <text class="rule-num">2</text>
            <text class="rule-text">新顾客点击链接进入并首次下单</text>
          </view>
          <view class="rule-item">
            <text class="rule-num">3</text>
            <text class="rule-text">双方各获得3元无门槛优惠券</text>
          </view>
          <view class="rule-item">
            <text class="rule-num">4</text>
            <text class="rule-text">优惠券7天内有效，不可叠加使用</text>
          </view>
        </view>
      </view>
    </view>

    <view class="share-section">
      <view class="section-card card">
        <text class="section-title">立即分享</text>
        <view class="share-card">
          <image :src="shareQrcode" class="qrcode-img" mode="widthFix" />
          <text class="qrcode-text">保存图片，分享到小区群</text>
        </view>
        <view class="share-actions">
          <button class="btn-primary" @click="shareToWechat">
            <text class="btn-icon">💬</text>
            <text>分享到微信群</text>
          </button>
          <button class="btn-outline" @click="saveQrcode">
            <text class="btn-icon">📷</text>
            <text>保存二维码</text>
          </button>
        </view>
      </view>
    </view>

    <view class="records-section">
      <view class="section-card card">
        <view class="section-header flex-between">
          <text class="section-title">分享记录</text>
          <text class="section-more">查看全部 →</text>
        </view>
        <view class="records-list">
          <view v-for="record in shareRecords" :key="record.id" class="record-item">
            <view class="record-info">
              <text class="record-name">{{ record.name }}</text>
              <text class="record-time">{{ record.time }}</text>
            </view>
            <text class="record-status" :class="record.status">{{ record.statusText }}</text>
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
    const totalShares = ref(128)
    const newCustomers = ref(36)
    const totalBonus = ref(216)
    const shareQrcode = ref('https://neeko-copilot.bytedance.net/api/text_to_image?prompt=QR%20code%20on%20white%20background&image_size=square')

    const shareRecords = ref([
      { id: 1, name: '张阿姨', time: '今天 10:30', status: 'pending', statusText: '待下单' },
      { id: 2, name: '李女士', time: '昨天 16:20', status: 'success', statusText: '已奖励' },
      { id: 3, name: '王先生', time: '昨天 14:10', status: 'success', statusText: '已奖励' },
      { id: 4, name: '刘姐', time: '前天 09:00', status: 'failed', statusText: '未下单' }
    ])

    const shareToWechat = () => {
      uni.showToast({ title: '请分享到微信群', icon: 'none' })
    }

    const saveQrcode = () => {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    }

    return {
      totalShares,
      newCustomers,
      totalBonus,
      shareQrcode,
      shareRecords,
      shareToWechat,
      saveQrcode
    }
  }
}
</script>

<style lang="scss" scoped>
.banner-section {
  padding: 20rpx;
}

.banner-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #FF6B35, #E85D04);
  border-radius: $radius-lg;

  .banner-icon {
    font-size: 64rpx;
    margin-right: 20rpx;
  }

  .banner-content {
    .banner-title {
      display: block;
      font-size: $font-size-lg;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 8rpx;
    }

    .banner-desc {
      font-size: $font-size-sm;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.stats-section {
  padding: 0 20rpx 20rpx;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 30rpx;

  .stat-item {
    text-align: center;

    .stat-value {
      display: block;
      font-size: $font-size-xl;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }

  .stat-divider {
    width: 1rpx;
    background: $bg-color;
  }
}

.rules-section,
.share-section,
.records-section {
  padding: 0 20rpx 20rpx;
}

.section-card {
  padding: 20rpx;

  .section-title {
    display: block;
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 20rpx;
  }

  .section-header {
    margin-bottom: 20rpx;

    .section-more {
      font-size: $font-size-sm;
      color: $primary-color;
    }
  }
}

.rules-list {
  .rule-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .rule-num {
      width: 40rpx;
      height: 40rpx;
      background: $primary-color;
      color: #FFFFFF;
      border-radius: $radius-round;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-size-xs;
      font-weight: 600;
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .rule-text {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.5;
    }
  }
}

.share-card {
  text-align: center;
  margin-bottom: 20rpx;

  .qrcode-img {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 12rpx;
  }

  .qrcode-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.share-actions {
  display: flex;
  gap: 16rpx;

  button {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;

    .btn-icon {
      font-size: $font-size-lg;
    }
  }
}

.records-list {
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .record-info {
      .record-name {
        display: block;
        font-size: $font-size-sm;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .record-time {
        font-size: $font-size-xs;
        color: $text-light;
      }
    }

    .record-status {
      font-size: $font-size-xs;
      padding: 4rpx 12rpx;
      border-radius: 12rpx;

      &.pending {
        background: #FFF5F0;
        color: $primary-color;
      }

      &.success {
        background: #E8F5E9;
        color: #2E7D32;
      }

      &.failed {
        background: #F5F5F5;
        color: $text-light;
      }
    }
  }
}
</style>
