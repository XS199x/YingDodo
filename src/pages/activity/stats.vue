<template>
  <view class="page-container">
    <view v-if="stats" class="stats-content">
      <view class="summary-card">
        <view class="summary-icon">📊</view>
        <view class="summary-text">{{ stats.summary }}</view>
      </view>

      <view class="stats-grid">
        <view class="stat-card">
          <view class="stat-number highlight">{{ stats.scanCount }}</view>
          <view class="stat-label">浏览人数</view>
        </view>
        <view class="stat-card">
          <view class="stat-number highlight">{{ stats.claimCount }}</view>
          <view class="stat-label">领券人数</view>
        </view>
        <view class="stat-card">
          <view class="stat-number highlight">{{ stats.shareCount }}</view>
          <view class="stat-label">分享次数</view>
        </view>
        <view class="stat-card">
          <view class="stat-number primary">{{ stats.newCustomerCount }}</view>
          <view class="stat-label">新增客户</view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">活动信息</view>
        <view class="activity-brief" v-if="activity">
          <text class="brief-title">{{ activity.title }}</text>
          <text class="brief-time text-sm text-light">
            {{ formatDate(activity.start_time) }} ~ {{ formatDate(activity.end_time) }}
          </text>
        </view>
      </view>

      <view class="tips-card">
        <view class="tips-title">💡 提升效果小技巧</view>
        <view class="tips-item">1. 把海报发到你的客户群和朋友圈</view>
        <view class="tips-item">2. 在店铺门口贴上海报二维码</view>
        <view class="tips-item">3. 让老客户帮忙转发，给点小奖励</view>
      </view>
    </view>

    <empty-state v-else text="加载中..." />
  </view>
</template>

<script>
import { getActivityStats, getActivityDetail } from '@/common/api.js'
import { formatDate } from '@/common/utils.js'
import EmptyState from '@/components/empty-state/empty-state.vue'

export default {
  components: { EmptyState },
  data() {
    return {
      stats: null,
      activity: null,
      activityId: ''
    }
  },
  onLoad(options) {
    this.activityId = options.id
    this.loadData()
  },
  onShow() {
    if (this.activityId) {
      this.loadStats()
    }
  },
  methods: {
    formatDate,
    async loadData() {
      try {
        const [statsRes, detailRes] = await Promise.all([
          getActivityStats(this.activityId),
          getActivityDetail(this.activityId)
        ])
        if (statsRes.code === 0) {
          this.stats = statsRes.data
        }
        if (detailRes.code === 0) {
          this.activity = detailRes.data
        }
      } catch (e) {
        console.error('加载数据失败:', e)
      }
    },
    async loadStats() {
      try {
        const res = await getActivityStats(this.activityId)
        if (res.code === 0) {
          this.stats = res.data
        }
      } catch (e) {
        console.error('加载统计失败:', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-card {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  margin: 20rpx;
  padding: 30rpx;
  border-radius: $radius-base;
  display: flex;
  align-items: center;

  .summary-icon {
    font-size: 48rpx;
    margin-right: 20rpx;
  }

  .summary-text {
    flex: 1;
    font-size: $font-size-lg;
    color: #FFFFFF;
    font-weight: 500;
    line-height: 1.5;
  }
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 10rpx;

  .stat-card {
    width: calc(50% - 20rpx);
    margin: 10rpx;
    background: $bg-white;
    border-radius: $radius-base;
    padding: 30rpx;
    text-align: center;
    box-shadow: $shadow-card;

    .stat-number {
      font-size: 52rpx;
      font-weight: 700;
      margin-bottom: 8rpx;

      &.highlight {
        color: $primary-color;
      }

      &.primary {
        color: $success-color;
      }
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }
}

.activity-brief {
  display: flex;
  flex-direction: column;

  .brief-title {
    font-size: $font-size-base;
    color: $text-color;
    font-weight: 500;
    margin-bottom: 8rpx;
  }
}

.tips-card {
  margin: 20rpx;
  padding: 24rpx;
  background: #FFF8E8;
  border-radius: $radius-base;

  .tips-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $warning-color;
    margin-bottom: 12rpx;
  }

  .tips-item {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 2;
  }
}
</style>