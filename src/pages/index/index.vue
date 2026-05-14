<template>
  <view class="page-container">
    <view class="header">
      <view class="header-title">营多多</view>
      <view class="header-subtitle">选个活动，开始拉客吧</view>
    </view>

    <view class="section-title">选择活动模板</view>
    <view class="template-grid">
      <view
        v-for="tpl in templates"
        :key="tpl.key"
        class="template-item"
        :style="{ background: tpl.color }"
        @click="goCreate(tpl.key)"
      >
        <text class="template-icon">{{ tpl.icon }}</text>
        <text class="template-name">{{ tpl.name }}</text>
        <text class="template-desc">{{ tpl.desc }}</text>
      </view>
    </view>

    <view v-if="activities.length > 0" class="section-title">我的活动</view>
    <view v-else class="section-title">还没有活动，选一个模板开始吧</view>

    <view class="activity-list">
      <view
        v-for="item in activities"
        :key="item._id"
        class="activity-item card"
        @click="goDetail(item._id)"
      >
        <view class="flex-between">
          <view class="activity-info">
            <view class="activity-title">{{ item.title }}</view>
            <view class="activity-desc text-sm text-secondary">{{ item.desc }}</view>
            <view class="activity-time text-sm text-light">
              {{ formatDate(item.created_at) }}
            </view>
          </view>
          <view class="activity-status">
            <text v-if="item.status === 'active'" class="tag tag-success">进行中</text>
            <text v-else-if="item.status === 'ended'" class="tag tag-default">已结束</text>
            <text v-else class="tag tag-warning">草稿</text>
          </view>
        </view>
        <view class="activity-actions flex-row">
          <button class="btn-sm btn-outline" @click.stop="goStats(item._id)">看效果</button>
          <button class="btn-sm btn-primary" @click.stop="goDetail(item._id)">生成海报</button>
        </view>
      </view>
    </view>

    <empty-state
      v-if="activities.length === 0"
      text="还没有创建活动"
      subtext="选一个模板，3步搞定你的第一个营销活动"
    />
  </view>
</template>

<script>
import { TEMPLATE_TYPES, formatDate } from '@/common/utils.js'
import { getActivities } from '@/common/api.js'
import EmptyState from '@/components/empty-state/empty-state.vue'

export default {
  components: { EmptyState },
  data() {
    return {
      templates: TEMPLATE_TYPES,
      activities: []
    }
  },
  onShow() {
    this.loadActivities()
  },
  methods: {
    formatDate,
    async loadActivities() {
      try {
        const res = await getActivities()
        if (res.code === 0) {
          this.activities = res.data
        }
      } catch (e) {
        console.error('加载活动失败:', e)
      }
    },
    goCreate(templateType) {
      uni.navigateTo({
        url: `/pages/activity/create?type=${templateType}`
      })
    },
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/activity/detail?id=${id}`
      })
    },
    goStats(id) {
      uni.navigateTo({
        url: `/pages/activity/stats?id=${id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  background: $primary-color;
  padding: 40rpx 30rpx 50rpx;
  color: #FFFFFF;

  .header-title {
    font-size: 48rpx;
    font-weight: 700;
    margin-bottom: 8rpx;
  }

  .header-subtitle {
    font-size: $font-size-base;
    color: rgba(255, 255, 255, 0.9);
  }
}

.template-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20rpx;

  .template-item {
    width: calc(33.33% - 20rpx);
    margin: 10rpx;
    border-radius: $radius-base;
    padding: 30rpx 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: $shadow-card;

    .template-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }

    .template-name {
      font-size: $font-size-base;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 6rpx;
    }

    .template-desc {
      font-size: $font-size-xs;
      color: rgba(255, 255, 255, 0.85);
      text-align: center;
    }
  }
}

.activity-list {
  padding: 0 20rpx;
}

.activity-item {
  margin-bottom: 16rpx;

  .activity-info {
    flex: 1;
    margin-right: 20rpx;
  }

  .activity-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 8rpx;
  }

  .activity-desc {
    margin-bottom: 8rpx;
  }

  .activity-actions {
    margin-top: 20rpx;
    gap: 16rpx;

    button {
      flex: 1;
    }
  }
}
</style>