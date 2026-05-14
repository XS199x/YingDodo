<template>
  <view class="page-container">
    <view class="profile-header">
    <image
      :src="(shopInfo && shopInfo.logo) || '/static/images/default-shop.png'"
      class="shop-logo"
      mode="aspectFill"
    />
    <view class="shop-name">{{ (shopInfo && shopInfo.name) || '未设置店铺名称' }}</view>
    <view class="shop-desc text-sm" v-if="shopInfo && shopInfo.name">快去创建活动拉客吧</view>
    <view class="shop-desc text-sm" v-else @click="goConfig">点击设置店铺信息</view>
  </view>

    <view class="stats-row">
      <view class="stats-item" @click="goActivities">
        <view class="stats-num">{{ overview.activeActivityCount || 0 }}</view>
        <view class="stats-label">进行中活动</view>
      </view>
      <view class="stats-item" @click="switchTabCustomer">
        <view class="stats-num">{{ overview.totalCustomerCount || 0 }}</view>
        <view class="stats-label">累计客户</view>
      </view>
      <view class="stats-item">
        <view class="stats-num">{{ overview.totalScanCount || 0 }}</view>
        <view class="stats-label">总浏览</view>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item flex-between" @click="goConfig">
        <view class="flex-row">
          <text class="menu-icon">🏪</text>
          <text class="menu-text">店铺设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item flex-between" @click="goActivities">
        <view class="flex-row">
          <text class="menu-icon">📋</text>
          <text class="menu-text">我的活动</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item flex-between" @click="switchTabCustomer">
        <view class="flex-row">
          <text class="menu-icon">👥</text>
          <text class="menu-text">客户管理</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item flex-between">
        <view class="flex-row">
          <text class="menu-icon">📖</text>
          <text class="menu-text">使用帮助</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item flex-between">
        <view class="flex-row">
          <text class="menu-icon">💬</text>
          <text class="menu-text">意见反馈</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="version text-center text-sm text-light">
      营多多 v1.0.0
    </view>
  </view>
</template>

<script>
import { getOverviewStats } from '@/common/api.js'
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['shopInfo'])
  },
  data() {
    return {
      overview: {
        activeActivityCount: 0,
        totalCustomerCount: 0,
        totalScanCount: 0
      }
    }
  },
  onShow() {
    this.loadOverview()
  },
  methods: {
    async loadOverview() {
      try {
        const res = await getOverviewStats()
        if (res.code === 0) {
          this.overview = res.data
        }
      } catch (e) {
        console.error('加载概览数据失败:', e)
      }
    },
    goConfig() {
      uni.navigateTo({
        url: '/pages/shop/config'
      })
    },
    goActivities() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    switchTabCustomer() {
      uni.switchTab({
        url: '/pages/customer/list'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-header {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 50rpx 30rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .shop-logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-round;
    border: 4rpx solid rgba(255, 255, 255, 0.4);
    margin-bottom: 16rpx;
    background: rgba(255, 255, 255, 0.2);
  }

  .shop-name {
    font-size: $font-size-xl;
    font-weight: 600;
    color: #FFFFFF;
    margin-bottom: 8rpx;
  }

  .shop-desc {
    color: rgba(255, 255, 255, 0.8);
  }
}

.stats-row {
  display: flex;
  background: $bg-white;
  margin: -30rpx 20rpx 20rpx;
  border-radius: $radius-base;
  padding: 24rpx 0;
  box-shadow: $shadow-card;
  position: relative;
  z-index: 1;

  .stats-item {
    flex: 1;
    text-align: center;

    .stats-num {
      font-size: 40rpx;
      font-weight: 700;
      color: $primary-color;
      margin-bottom: 6rpx;
    }

    .stats-label {
      font-size: $font-size-xs;
      color: $text-light;
    }
  }
}

.menu-list {
  margin: 0 20rpx;

  .menu-item {
    background: $bg-white;
    padding: 28rpx 24rpx;
    border-bottom: 1rpx solid $border-color;

    &:first-child {
      border-radius: $radius-base $radius-base 0 0;
    }

    &:last-child {
      border-radius: 0 0 $radius-base $radius-base;
      border-bottom: none;
    }

    .menu-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }

    .menu-text {
      font-size: $font-size-base;
      color: $text-color;
    }

    .menu-arrow {
      font-size: 36rpx;
      color: $text-light;
    }
  }
}

.version {
  padding: 40rpx;
}
</style>