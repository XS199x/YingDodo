<template>
  <view class="page-container">
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ distributorCount }}</text>
        <text class="stat-label">分销员</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">¥{{ totalCommission }}</text>
        <text class="stat-label">累计佣金</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ orderCount }}</text>
        <text class="stat-label">分销订单</text>
      </view>
    </view>

    <view class="invite-section">
      <view class="invite-card card">
        <view class="invite-header">
          <text class="invite-icon">👭</text>
          <view class="invite-info">
            <text class="invite-title">邀请邻居当分销员</text>
            <text class="invite-desc">分享链接，邀请成功即成为分销员</text>
          </view>
        </view>
        <view class="invite-footer">
          <button class="btn-primary" @click="inviteDistributor">
            <text>立即邀请</text>
          </button>
        </view>
      </view>
    </view>

    <view class="distributors-section">
      <view class="section-card card">
        <view class="section-header flex-between">
          <text class="section-title">分销员列表</text>
          <text class="section-more">查看全部 →</text>
        </view>
        <view class="distributors-list">
          <view v-for="dist in distributors" :key="dist.id" class="distributor-item">
            <image :src="dist.avatar" class="dist-avatar" mode="aspectFill" />
            <view class="dist-info">
              <text class="dist-name">{{ dist.name }}</text>
              <text class="dist-phone">{{ dist.phone }}</text>
            </view>
            <view class="dist-stats">
              <text class="dist-order">订单{{ dist.orders }}</text>
              <text class="dist-commission">佣金¥{{ dist.commission }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="commission-section">
      <view class="section-card card">
        <view class="section-header flex-between">
          <text class="section-title">佣金设置</text>
        </view>
        <view class="commission-settings">
          <view class="setting-item">
            <text class="setting-label">分销比例</text>
            <view class="setting-value">
              <text>{{ commissionRate }}%</text>
              <text class="setting-arrow">›</text>
            </view>
          </view>
          <view class="setting-item">
            <text class="setting-label">结算方式</text>
            <text class="setting-value">按周结算</text>
          </view>
          <view class="setting-item">
            <text class="setting-label">最低提现</text>
            <text class="setting-value">¥100</text>
          </view>
        </view>
      </view>
    </view>

    <view class="records-section">
      <view class="section-card card">
        <view class="section-header flex-between">
          <text class="section-title">结算记录</text>
          <text class="section-more">查看全部 →</text>
        </view>
        <view class="records-list">
          <view v-for="record in records" :key="record.id" class="record-item">
            <view class="record-info">
              <text class="record-name">{{ record.name }}</text>
              <text class="record-time">{{ record.time }}</text>
            </view>
            <view class="record-amount" :class="record.type">
              {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount }}
            </view>
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
    const distributorCount = ref(8)
    const totalCommission = ref(1256)
    const orderCount = ref(68)
    const commissionRate = ref(10)

    const distributors = ref([
      { id: 1, name: '张阿姨', phone: '138****8888', avatar: '', orders: 15, commission: 320 },
      { id: 2, name: '李姐', phone: '139****6666', avatar: '', orders: 12, commission: 256 },
      { id: 3, name: '王女士', phone: '137****5555', avatar: '', orders: 8, commission: 180 },
      { id: 4, name: '刘阿姨', phone: '136****4444', avatar: '', orders: 6, commission: 128 }
    ])

    const records = ref([
      { id: 1, name: '张阿姨', time: '本周', type: 'outcome', amount: 320 },
      { id: 2, name: '李姐', time: '本周', type: 'outcome', amount: 256 },
      { id: 3, name: '分销收入', time: '本周', type: 'income', amount: 1256 },
      { id: 4, name: '王女士', time: '上周', type: 'outcome', amount: 180 }
    ])

    const inviteDistributor = () => {
      uni.showToast({ title: '分享邀请链接', icon: 'none' })
    }

    return {
      distributorCount,
      totalCommission,
      orderCount,
      commissionRate,
      distributors,
      records,
      inviteDistributor
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  background: $bg-white;
  margin-bottom: 20rpx;

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
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }

  .stat-divider {
    width: 1rpx;
    background: $bg-color;
  }
}

.invite-section {
  padding: 0 20rpx 20rpx;
}

.invite-card {
  padding: 24rpx;
  background: linear-gradient(135deg, #FF6B35, #E85D04);

  .invite-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .invite-icon {
      font-size: 56rpx;
      margin-right: 16rpx;
    }

    .invite-info {
      .invite-title {
        display: block;
        font-size: $font-size-base;
        font-weight: 600;
        color: #FFFFFF;
        margin-bottom: 4rpx;
      }

      .invite-desc {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .invite-footer {
    button {
      width: 100%;
      background: #FFFFFF;
      color: $primary-color;
    }
  }
}

.distributors-section,
.commission-section,
.records-section {
  padding: 0 20rpx 20rpx;
}

.section-card {
  padding: 20rpx;

  .section-header {
    margin-bottom: 16rpx;

    .section-title {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color;
    }

    .section-more {
      font-size: $font-size-sm;
      color: $primary-color;
    }
  }
}

.distributors-list {
  .distributor-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .dist-avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: $radius-round;
      background: $bg-color;
      margin-right: 16rpx;
    }

    .dist-info {
      flex: 1;

      .dist-name {
        display: block;
        font-size: $font-size-base;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .dist-phone {
        font-size: $font-size-xs;
        color: $text-light;
      }
    }

    .dist-stats {
      text-align: right;

      .dist-order {
        display: block;
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-bottom: 4rpx;
      }

      .dist-commission {
        font-size: $font-size-sm;
        color: $primary-color;
        font-weight: 500;
      }
    }
  }
}

.commission-settings {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .setting-label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    .setting-value {
      font-size: $font-size-sm;
      color: $text-color;
      display: flex;
      align-items: center;

      .setting-arrow {
        margin-left: 8rpx;
        color: $text-light;
      }
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

    .record-amount {
      font-size: $font-size-sm;
      font-weight: 500;

      &.income {
        color: #2E7D32;
      }

      &.outcome {
        color: #FF4757;
      }
    }
  }
}
</style>
