<template>
  <view class="page-container">
    <view v-if="activity" class="activity-detail">
      <view class="cover-area">
        <image
          v-if="activity.cover"
          :src="activity.cover"
          class="cover-image"
          mode="aspectFill"
        />
        <view v-else class="cover-placeholder">
          <text class="cover-icon">{{ templateIcon }}</text>
        </view>
        <view class="cover-tag" :style="{ background: templateColor }">
          {{ templateName }}
        </view>
      </view>

      <view class="card">
        <view class="activity-title">{{ activity.title }}</view>
        <view class="activity-desc text-secondary">{{ activity.desc }}</view>

        <view class="info-row" v-if="activity.config">
          <view
            v-for="(value, key) in displayConfig"
            :key="key"
            class="info-item"
          >
            <text class="info-label">{{ key }}</text>
            <text class="info-value">{{ value }}</text>
          </view>
        </view>

        <view class="time-row text-sm text-light">
          <text>{{ formatDate(activity.start_time) }} ~ {{ formatDate(activity.end_time) }}</text>
        </view>
      </view>

      <view class="action-row">
        <button class="btn-sm btn-outline" @click="goEdit">编辑活动</button>
        <button class="btn-sm btn-danger" @click="deleteActivity">删除活动</button>
      </view>

      <view class="bottom-action">
        <button class="btn-outline" @click="goStats" style="margin-bottom: 20rpx;">查看效果</button>
        <button class="btn-primary" @click="goPoster">生成海报</button>
      </view>
    </view>

    <empty-state v-else text="活动不存在" />
  </view>
</template>

<script>
import { getActivityDetail } from '@/common/api.js'
import { formatDate, getTemplateConfig, TEMPLATE_TYPES } from '@/common/utils.js'
import EmptyState from '@/components/empty-state/empty-state.vue'

export default {
  components: { EmptyState },
  data() {
    return {
      activity: null,
      activityId: ''
    }
  },
  computed: {
    templateInfo() {
      if (!this.activity) return {}
      return getTemplateConfig(this.activity.template_type) || {}
    },
    templateName() {
      const tpl = TEMPLATE_TYPES.find(t => t.key === this.activity?.template_type)
      return tpl ? tpl.name : ''
    },
    templateColor() {
      const tpl = TEMPLATE_TYPES.find(t => t.key === this.activity?.template_type)
      return tpl ? tpl.color : '#FF6B35'
    },
    templateIcon() {
      const tpl = TEMPLATE_TYPES.find(t => t.key === this.activity?.template_type)
      return tpl ? tpl.icon : '📋'
    },
    displayConfig() {
      if (!this.activity || !this.activity.config) return {}
      const fields = this.templateInfo.fields || []
      const display = {}
      fields.forEach(f => {
        if (this.activity.config[f.key]) {
          display[f.label] = this.activity.config[f.key]
        }
      })
      return display
    }
  },
  onLoad(options) {
    this.activityId = options.id
    this.loadDetail()
  },
  methods: {
    formatDate,
    async loadDetail() {
      try {
        const res = await getActivityDetail(this.activityId)
        if (res.code === 0) {
          this.activity = res.data
        }
      } catch (e) {
        console.error('加载活动详情失败:', e)
      }
    },
    goStats() {
      uni.navigateTo({
        url: `/pages/activity/stats?id=${this.activityId}`
      })
    },
    goPoster() {
      uni.navigateTo({
        url: `/pages/poster/preview?activityId=${this.activityId}`
      })
    },
    goEdit() {
      uni.navigateTo({
        url: `/pages/activity/create?id=${this.activityId}`
      })
    },
    deleteActivity() {
      uni.showModal({
        title: '确认删除',
        content: '删除后将无法恢复，确定要删除这个活动吗？',
        success: (res) => {
          if (res.confirm) {
            this.doDelete()
          }
        }
      })
    },
    async doDelete() {
      try {
        uni.showLoading({ title: '删除中...' })
        const { deleteActivity } = await import('@/common/api.js')
        const res = await deleteActivity(this.activityId)
        if (res.code === 0) {
          uni.hideLoading()
          uni.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.hideLoading()
          uni.showToast({ title: res.msg || '删除失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cover-area {
  position: relative;
  width: 100%;
  height: 360rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);

  .cover-image {
    width: 100%;
    height: 100%;
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .cover-icon {
      font-size: 80rpx;
    }
  }

  .cover-tag {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    font-size: $font-size-xs;
    color: #FFFFFF;
    font-weight: 500;
  }
}

.activity-title {
  font-size: $font-size-xl;
  font-weight: 700;
  color: $text-color;
  margin-bottom: 12rpx;
}

.activity-desc {
  font-size: $font-size-base;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;

  .info-item {
    width: 50%;
    margin-bottom: 16rpx;

    .info-label {
      display: block;
      font-size: $font-size-xs;
      color: $text-light;
      margin-bottom: 4rpx;
    }

    .info-value {
      font-size: $font-size-base;
      color: $text-color;
      font-weight: 500;
    }
  }
}

.time-row {
  padding-top: 16rpx;
  border-top: 1rpx solid $border-color;
}

.action-row {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;

  .btn-sm {
    flex: 1;
    height: 68rpx;
    font-size: $font-size-base;
  }

  .btn-danger {
    background: #FF4D4F;
    color: #FFFFFF;
    border: none;

    &:active {
      opacity: 0.85;
    }
  }
}

.bottom-action {
  padding: 30rpx 20rpx;
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;
}
</style>