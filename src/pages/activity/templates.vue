<template>
  <view class="page-container">
    <view class="page-header">
      <text class="page-title">选择活动类型</text>
      <text class="page-subtitle">选择适合您的活动模板</text>
    </view>

    <view class="category-tabs">
      <text 
        v-for="cat in categories" 
        :key="cat"
        class="tab-item"
        :class="{ active: activeCategory === cat }"
        @click="activeCategory = cat"
      >{{ cat }}</text>
    </view>

    <view class="template-list">
      <view
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        class="template-card card"
        @click="selectTemplate(tpl)"
      >
        <view class="template-header">
          <view class="template-icon" :style="{ background: tpl.bgColor }">
            {{ tpl.icon }}
          </view>
          <view class="template-meta">
            <text class="template-name">{{ tpl.name }}</text>
            <text class="template-desc">{{ tpl.description }}</text>
          </view>
        </view>
        
        <view class="template-stats">
          <view class="stat-item">
            <text class="stat-value">{{ tpl.popularity }}%</text>
            <text class="stat-label">人气</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ tpl.conversion }}%</text>
            <text class="stat-label">转化率</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ tpl.difficulty }}</text>
            <text class="stat-label">难度</text>
          </view>
        </view>

        <view class="template-features">
          <view v-for="feature in tpl.features" :key="feature" class="feature-tag">
            {{ feature }}
          </view>
        </view>

        <view class="template-action">
          <text class="action-btn">立即创建</text>
        </view>
      </view>
    </view>

    <view class="modal-overlay" v-if="showModal" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedTemplate?.name }}</text>
          <text class="modal-close" @click="showModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="modal-icon">{{ selectedTemplate?.icon }}</view>
          <text class="modal-desc">{{ selectedTemplate?.description }}</text>
          
          <view class="modal-section">
            <text class="section-label">活动特点</text>
            <view class="feature-list">
              <view v-for="(feature, index) in selectedTemplate?.features" :key="index" class="feature-item">
                <text class="feature-check">✓</text>
                <text class="feature-text">{{ feature }}</text>
              </view>
            </view>
          </view>

          <view class="modal-section">
            <text class="section-label">适用场景</text>
            <view class="scene-tags">
              <text v-for="scene in selectedTemplate?.scenes" :key="scene" class="scene-tag">{{ scene }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-outline" @click="showModal = false">取消</button>
          <button class="btn-primary" @click="goCreate">开始创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'

const TEMPLATES = [
  {
    id: 'groupbuy',
    name: '拼团活动',
    icon: '👥',
    description: '多人拼团享优惠，社交裂变拉新',
    category: '促销',
    bgColor: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
    popularity: 92,
    conversion: 33,
    difficulty: '简单',
    features: ['多人拼单优惠', '社交分享传播', '自动成团提醒', '实时进度展示'],
    scenes: ['新品推广', '销量提升', '节日促销']
  },
  {
    id: 'bargain',
    name: '砍价活动',
    icon: '🔪',
    description: '邀请好友帮忙砍价，零元抱回家',
    category: '拉新',
    bgColor: 'linear-gradient(135deg, #FF6B6B, #EE5A24)',
    popularity: 95,
    conversion: 35,
    difficulty: '简单',
    features: ['好友助力砍价', '实时价格更新', '分享激励机制', '助力排行榜'],
    scenes: ['爆款引流', '新客获取', '品牌曝光']
  },
  {
    id: 'lottery',
    name: '抽奖活动',
    icon: '🎲',
    description: '幸运大抽奖，增加互动乐趣',
    category: '互动',
    bgColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
    popularity: 88,
    conversion: 30,
    difficulty: '中等',
    features: ['多种奖品设置', '抽奖次数限制', '中奖概率控制', '中奖记录展示'],
    scenes: ['节日活动', '粉丝互动', '会员回馈']
  },
  {
    id: 'seckill',
    name: '限时秒杀',
    icon: '⚡',
    description: '限时特价，营造抢购氛围',
    category: '促销',
    bgColor: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
    popularity: 90,
    conversion: 32,
    difficulty: '简单',
    features: ['倒计时展示', '库存实时更新', '限购数量设置', '秒杀提醒'],
    scenes: ['清仓处理', '新品上市', '流量提升']
  },
  {
    id: 'coupon',
    name: '优惠券',
    icon: '🎫',
    description: '发放优惠券，刺激消费转化',
    category: '促销',
    bgColor: 'linear-gradient(135deg, #3498DB, #2980B9)',
    popularity: 85,
    conversion: 28,
    difficulty: '简单',
    features: ['多种面额设置', '使用条件限制', '领取记录管理', '到期提醒'],
    scenes: ['新店开业', '会员回馈', '节日促销']
  },
  {
    id: 'checkin',
    name: '签到打卡',
    icon: '✅',
    description: '每日签到领奖励，提升客户粘性',
    category: '会员',
    bgColor: 'linear-gradient(135deg, #1ABC9C, #16A085)',
    popularity: 82,
    conversion: 25,
    difficulty: '中等',
    features: ['连续签到奖励', '积分累计机制', '签到日历展示', '奖励兑换'],
    scenes: ['日常活跃', '客户留存', '会员养成']
  },
  {
    id: 'points',
    name: '积分兑换',
    icon: '⭐',
    description: '积分兑换礼品，提升客户忠诚度',
    category: '会员',
    bgColor: 'linear-gradient(135deg, #E74C3C, #C0392B)',
    popularity: 80,
    conversion: 22,
    difficulty: '中等',
    features: ['积分商城', '礼品库存管理', '兑换记录', '积分规则'],
    scenes: ['会员体系', '节日活动', '客户留存']
  },
  {
    id: 'invite',
    name: '邀请有礼',
    icon: '👫',
    description: '邀请好友得奖励，裂变增长',
    category: '拉新',
    bgColor: 'linear-gradient(135deg, #27AE60, #2ECC71)',
    popularity: 86,
    conversion: 26,
    difficulty: '简单',
    features: ['邀请链接生成', '奖励机制设置', '邀请排行榜', '成功邀请通知'],
    scenes: ['新客获取', '裂变增长', '社交传播']
  }
]

export default {
  setup() {
    const activeCategory = ref('全部')
    const showModal = ref(false)
    const selectedTemplate = ref(null)

    const categories = ['全部', '促销', '拉新', '互动', '会员']

    const filteredTemplates = computed(() => {
      if (activeCategory.value === '全部') {
        return TEMPLATES
      }
      return TEMPLATES.filter(t => t.category === activeCategory.value)
    })

    const selectTemplate = (template) => {
      selectedTemplate.value = template
      showModal.value = true
    }

    const goCreate = () => {
      showModal.value = false
      uni.navigateTo({
        url: `/pages/activity/create?type=${selectedTemplate.value.id}`
      })
    }

    return {
      activeCategory,
      categories,
      filteredTemplates,
      showModal,
      selectedTemplate,
      selectTemplate,
      goCreate
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  background: $primary-color;
  padding: 40rpx 30rpx 50rpx;
  color: #FFFFFF;

  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    margin-bottom: 8rpx;
  }

  .page-subtitle {
    font-size: $font-size-base;
    color: rgba(255, 255, 255, 0.9);
  }
}

.category-tabs {
  display: flex;
  background: $bg-white;
  padding: 16rpx 20rpx;
  gap: 12rpx;
  border-bottom: 1rpx solid $bg-color;

  .tab-item {
    padding: 12rpx 24rpx;
    font-size: $font-size-sm;
    color: $text-secondary;
    background: $bg-color;
    border-radius: $radius-lg;
    transition: all 0.3s;

    &.active {
      background: $primary-color;
      color: #FFFFFF;
    }
  }
}

.template-list {
  padding: 20rpx;
}

.template-card {
  margin-bottom: 20rpx;
  overflow: hidden;

  .template-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .template-icon {
      width: 88rpx;
      height: 88rpx;
      border-radius: $radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 44rpx;
      margin-right: 20rpx;
    }

    .template-meta {
      flex: 1;

      .template-name {
        display: block;
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 6rpx;
      }

      .template-desc {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }

  .template-stats {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 20rpx 0;
    background: $bg-color;
    margin: 0 -24rpx;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: $font-size-lg;
        font-weight: 600;
        color: $primary-color;
        margin-bottom: 4rpx;
      }

      .stat-label {
        font-size: $font-size-xs;
        color: $text-light;
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 40rpx;
      background: #DDDDDD;
    }
  }

  .template-features {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 20rpx;

    .feature-tag {
      padding: 8rpx 16rpx;
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      font-size: $font-size-xs;
      border-radius: 20rpx;
    }
  }

  .template-action {
    margin-top: 20rpx;

    .action-btn {
      display: block;
      text-align: center;
      padding: 24rpx;
      background: $primary-color;
      color: #FFFFFF;
      font-size: $font-size-base;
      font-weight: 600;
      border-radius: $radius-base;
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content {
    width: 600rpx;
    background: $bg-white;
    border-radius: $radius-lg;
    overflow: hidden;

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx;
      border-bottom: 1rpx solid $bg-color;

      .modal-title {
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color;
      }

      .modal-close {
        font-size: $font-size-xl;
        color: $text-light;
        padding: 8rpx;
      }
    }

    .modal-body {
      padding: 30rpx 24rpx;
      text-align: center;

      .modal-icon {
        font-size: 80rpx;
        margin-bottom: 16rpx;
      }

      .modal-desc {
        font-size: $font-size-base;
        color: $text-secondary;
        line-height: 1.6;
      }

      .modal-section {
        margin-top: 24rpx;
        text-align: left;

        .section-label {
          display: block;
          font-size: $font-size-sm;
          color: $text-light;
          margin-bottom: 12rpx;
        }

        .feature-list {
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 10rpx;

            .feature-check {
              color: $success-color;
              margin-right: 12rpx;
            }

            .feature-text {
              font-size: $font-size-sm;
              color: $text-color;
            }
          }
        }

        .scene-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10rpx;

          .scene-tag {
            padding: 6rpx 16rpx;
            background: $bg-color;
            color: $text-secondary;
            font-size: $font-size-xs;
            border-radius: 20rpx;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      padding: 20rpx 24rpx;
      gap: 16rpx;
      border-top: 1rpx solid $bg-color;

      button {
        flex: 1;
        height: 80rpx;
      }
    }
  }
}
</style>