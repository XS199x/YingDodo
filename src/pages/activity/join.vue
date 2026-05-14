<template>
  <view class="page-container">
    <view v-if="loading" class="loading-area flex-center">
      <text>加载中...</text>
    </view>

    <view v-else-if="activity" class="activity-join">
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
          <text>活动时间：{{ formatDate(activity.start_time) }} ~ {{ formatDate(activity.end_time) }}</text>
        </view>
      </view>

      <view class="card">
        <view class="card-title">参与方式</view>
        <view class="join-steps">
          <view class="step-item">
            <view class="step-num">1</view>
            <view class="step-content">
              <text class="step-title">点击下方按钮参与活动</text>
            </view>
          </view>
          <view class="step-item">
            <view class="step-num">2</view>
            <view class="step-content">
              <text class="step-title">添加客服微信</text>
            </view>
          </view>
          <view class="step-item">
            <view class="step-num">3</view>
            <view class="step-content">
              <text class="step-title">获取专属福利</text>
            </view>
          </view>
        </view>
      </view>

      <view class="card" v-if="shopInfo">
        <view class="card-title">商家信息</view>
        <view class="shop-info">
          <image
            :src="(shopInfo && shopInfo.logo) || '/static/images/default-shop.png'"
            class="shop-logo"
            mode="aspectFill"
          />
          <view class="shop-detail">
            <text class="shop-name">{{ (shopInfo && shopInfo.name) || '商家名称' }}</text>
            <text class="shop-phone">{{ (shopInfo && shopInfo.phone) || '' }}</text>
          </view>
        </view>
      </view>

      <view class="card" v-if="shopInfo && shopInfo.group_qr">
        <view class="card-title">加入微信群</view>
        <view class="group-section">
          <image :src="shopInfo.group_qr" class="group-qr" mode="widthFix" />
          <text class="group-tips">长按识别二维码加入微信群</text>
        </view>
      </view>

      <view class="bottom-action">
        <button
          class="btn-primary"
          @click="joinActivity"
          :disabled="joined || joining"
        >
          {{ joining ? '参与中...' : (joined ? '已参与' : '立即参与') }}
        </button>
        <view class="action-tips" v-if="!joined">
          <text>参与后可获取专属福利</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">❌</text>
      <text class="empty-text">活动不存在或已结束</text>
    </view>
  </view>
</template>

<script>
import { getActivityDetail, recordCustomerAction } from '@/common/api.js'
import { formatDate, getTemplateConfig, TEMPLATE_TYPES } from '@/common/utils.js'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      activity: null,
      activityId: '',
      loading: false,
      joining: false,
      joined: false
    }
  },
  computed: {
    ...mapState(['shopInfo']),
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
    this.loadActivity()
  },
  methods: {
    formatDate,
    async loadActivity() {
      this.loading = true
      try {
        const res = await getActivityDetail(this.activityId)
        if (res.code === 0) {
          this.activity = res.data
          
          const endTime = new Date(this.activity.end_time)
          if (endTime < new Date()) {
            this.activity = null
          }
        }
      } catch (e) {
        console.error('加载活动失败:', e)
      } finally {
        this.loading = false
      }
    },
    async joinActivity() {
      if (this.joined || this.joining) return

      this.joining = true
      try {
        const res = await recordCustomerAction(this.activityId, 'join')
        
        if (res.code === 0) {
          this.joined = true
          uni.showToast({ title: '参与成功！', icon: 'success' })
        } else {
          uni.showToast({ title: res.msg || '参与失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '参与失败，请重试', icon: 'none' })
      } finally {
        this.joining = false
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
  background: $primary-color;

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

.join-steps {
  padding: 10rpx 0;

  .step-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .step-num {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background: $primary-color;
      color: #FFFFFF;
      font-size: $font-size-sm;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-right: 20rpx;
    }

    .step-content {
      flex: 1;

      .step-title {
        font-size: $font-size-base;
        color: $text-color;
        line-height: 1.5;
      }
    }
  }
}

.shop-info {
  display: flex;
  align-items: center;
  padding: 10rpx 0;

  .shop-logo {
    width: 100rpx;
    height: 100rpx;
    border-radius: $radius-base;
    margin-right: 20rpx;
  }

  .shop-detail {
    flex: 1;

    .shop-name {
      display: block;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 8rpx;
    }

    .shop-phone {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }
}

.group-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;

  .group-qr {
    width: 300rpx;
    height: 300rpx;
    border-radius: $radius-base;
  }

  .group-tips {
    font-size: $font-size-sm;
    color: $text-light;
    margin-top: 16rpx;
  }
}

.bottom-action {
  padding: 30rpx 20rpx;
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;

  .action-tips {
    text-align: center;
    margin-top: 16rpx;
    font-size: $font-size-sm;
    color: $text-light;
  }
}

.loading-area {
  height: 600rpx;
  font-size: $font-size-base;
  color: $text-light;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: $font-size-base;
    color: $text-light;
  }
}
</style>