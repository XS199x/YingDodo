<template>
  <view class="page-container">
    <view class="date-bar">
      <text class="date-title">今日经营小报</text>
      <text class="date-value">{{ currentDate }}</text>
    </view>

    <view class="summary-card card">
      <view class="summary-header">
        <text class="summary-title">今日概览</text>
        <text class="summary-compare" :class="revenueCompare > 0 ? 'up' : 'down'">
          {{ revenueCompare > 0 ? '↑' : '↓' }} {{ Math.abs(revenueCompare) }}% vs 上周
        </text>
      </view>
      <view class="summary-stats">
        <view class="summary-stat">
          <text class="stat-value">¥{{ todayRevenue }}</text>
          <text class="stat-label">营收</text>
        </view>
        <view class="summary-stat">
          <text class="stat-value">{{ todayOrders }}</text>
          <text class="stat-label">订单</text>
        </view>
        <view class="summary-stat">
          <text class="stat-value">{{ avgOrder }}</text>
          <text class="stat-label">客单价</text>
        </view>
        <view class="summary-stat">
          <text class="stat-value">{{ newCustomers }}</text>
          <text class="stat-label">新增客户</text>
        </view>
      </view>
    </view>

    <view class="chart-section">
      <view class="section-card card">
        <text class="section-title">销售趋势</text>
        <view class="chart-container">
          <view class="chart-bars">
            <view v-for="(day, index) in weekData" :key="index" class="bar-item">
              <view class="bar-wrapper">
                <view 
                  class="bar-fill" 
                  :style="{ height: (day.value / maxValue * 100) + '%' }"
                  :class="{ today: index === weekData.length - 1 }"
                ></view>
              </view>
              <text class="bar-label">{{ day.label }}</text>
              <text class="bar-value">¥{{ day.value }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="ranking-section">
      <view class="section-card card">
        <text class="section-title">热销商品</text>
        <view class="ranking-list">
          <view v-for="(item, index) in topProducts" :key="item.id" class="ranking-item">
            <view class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</view>
            <image :src="item.image" class="rank-image" mode="aspectFill" />
            <view class="rank-info">
              <text class="rank-name">{{ item.name }}</text>
              <text class="rank-count">销量 {{ item.sales }}</text>
            </view>
            <text class="rank-revenue">¥{{ item.revenue }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="tips-section">
      <view class="section-card card">
        <text class="section-title">运营建议</text>
        <view class="tips-list">
          <view v-for="(tip, index) in tips" :key="index" class="tip-item">
            <view class="tip-icon">{{ tip.icon }}</view>
            <view class="tip-content">
              <text class="tip-title">{{ tip.title }}</text>
              <text class="tip-desc">{{ tip.desc }}</text>
            </view>
            <text class="tip-action" @click="executeTip(tip)">去执行 →</text>
          </view>
        </view>
      </view>
    </view>

    <view class="action-section">
      <view class="action-card card">
        <view class="action-item" @click="goInventory">
          <view class="action-icon">📦</view>
          <text class="action-text">库存管理</text>
        </view>
        <view class="action-item" @click="goDistribution">
          <view class="action-icon">👭</view>
          <text class="action-text">分销管理</text>
        </view>
        <view class="action-item" @click="goOrders">
          <view class="action-icon">📋</view>
          <text class="action-text">订单统计</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const todayRevenue = ref(856)
    const todayOrders = ref(28)
    const avgOrder = ref(30.57)
    const newCustomers = ref(5)
    const revenueCompare = ref(12)

    const currentDate = computed(() => {
      const now = new Date()
      return `${now.getMonth() + 1}月${now.getDate()}日 ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]}`
    })

    const weekData = ref([
      { label: '周一', value: 680 },
      { label: '周二', value: 920 },
      { label: '周三', value: 750 },
      { label: '周四', value: 880 },
      { label: '周五', value: 960 },
      { label: '周六', value: 1100 },
      { label: '今日', value: 856 }
    ])

    const maxValue = computed(() => {
      return Math.max(...weekData.value.map(d => d.value))
    })

    const topProducts = ref([
      { id: 1, name: '进口车厘子', sales: 15, revenue: 1020, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cherries&image_size=square' },
      { id: 2, name: '新疆哈密瓜', sales: 12, revenue: 240, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=hami%20melon&image_size=square' },
      { id: 3, name: '有机草莓', sales: 8, revenue: 280, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=strawberries&image_size=square' }
    ])

    const tips = ref([
      { icon: '🍓', title: '草莓库存不足', desc: '库存还剩5斤，建议补货或设为今日特价', action: 'inventory' },
      { icon: '💰', title: '召回沉睡客户', desc: '8位客户超过30天未下单，发送优惠券召回', action: 'coupon' },
      { icon: '📈', title: '周二会员日', desc: '明天是周二会员日，准备好促销活动', action: 'activity' }
    ])

    const getRankClass = (index) => {
      const classes = ['gold', 'silver', 'bronze']
      return classes[index] || ''
    }

    const executeTip = (tip) => {
      if (tip.action === 'inventory') {
        uni.navigateTo({ url: '/pages/dashboard/inventory' })
      } else if (tip.action === 'coupon') {
        uni.navigateTo({ url: '/pages/customer/coupons' })
      }
    }

    const goInventory = () => {
      uni.navigateTo({ url: '/pages/dashboard/inventory' })
    }

    const goDistribution = () => {
      uni.navigateTo({ url: '/pages/dashboard/distribution' })
    }

    const goOrders = () => {
      uni.navigateTo({ url: '/pages/shop/orders' })
    }

    return {
      todayRevenue,
      todayOrders,
      avgOrder,
      newCustomers,
      revenueCompare,
      currentDate,
      weekData,
      maxValue,
      topProducts,
      tips,
      getRankClass,
      executeTip,
      goInventory,
      goDistribution,
      goOrders
    }
  }
}
</script>

<style lang="scss" scoped>
.date-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: $bg-white;

  .date-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-color;
  }

  .date-value {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.summary-card {
  margin: 20rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #FF6B35, #E85D04);
  border-radius: $radius-lg;

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .summary-title {
      font-size: $font-size-base;
      color: rgba(255, 255, 255, 0.9);
    }

    .summary-compare {
      font-size: $font-size-xs;
      padding: 4rpx 12rpx;
      border-radius: 12rpx;

      &.up {
        background: rgba(46, 125, 50, 0.3);
        color: #C8E6C9;
      }

      &.down {
        background: rgba(255, 71, 87, 0.3);
        color: #FFCDD2;
      }
    }
  }

  .summary-stats {
    display: flex;
    justify-content: space-around;

    .summary-stat {
      text-align: center;

      .stat-value {
        display: block;
        font-size: $font-size-xl;
        font-weight: 600;
        color: #FFFFFF;
        margin-bottom: 4rpx;
      }

      .stat-label {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.chart-section,
.ranking-section,
.tips-section {
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
}

.chart-container {
  .chart-bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 200rpx;
    padding-top: 20rpx;

    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;

      .bar-wrapper {
        width: 40rpx;
        height: 160rpx;
        background: $bg-color;
        border-radius: 8rpx;
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        margin-bottom: 8rpx;

        .bar-fill {
          width: 100%;
          background: linear-gradient(180deg, $primary-color, #FF8A5B);
          border-radius: 8rpx;
          transition: height 0.3s ease;

          &.today {
            background: linear-gradient(180deg, #2E7D32, #4CAF50);
          }
        }
      }

      .bar-label {
        font-size: 20rpx;
        color: $text-light;
        margin-bottom: 4rpx;
      }

      .bar-value {
        font-size: 20rpx;
        color: $text-secondary;
      }
    }
  }
}

.ranking-list {
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .rank-badge {
      width: 40rpx;
      height: 40rpx;
      border-radius: $radius-round;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-size-xs;
      font-weight: 600;
      margin-right: 16rpx;
      background: $bg-color;
      color: $text-secondary;

      &.gold {
        background: #FFD700;
        color: #8B4513;
      }

      &.silver {
        background: #C0C0C0;
        color: #333;
      }

      &.bronze {
        background: #CD7F32;
        color: #fff;
      }
    }

    .rank-image {
      width: 80rpx;
      height: 80rpx;
      border-radius: $radius-sm;
      margin-right: 16rpx;
    }

    .rank-info {
      flex: 1;

      .rank-name {
        display: block;
        font-size: $font-size-sm;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .rank-count {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .rank-revenue {
      font-size: $font-size-sm;
      color: $primary-color;
      font-weight: 500;
    }
  }
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .tip-item {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background: $bg-color;
    border-radius: $radius-sm;

    .tip-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }

    .tip-content {
      flex: 1;

      .tip-title {
        display: block;
        font-size: $font-size-sm;
        color: $text-color;
        margin-bottom: 4rpx;
      }

      .tip-desc {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .tip-action {
      font-size: $font-size-xs;
      color: $primary-color;
    }
  }
}

.action-section {
  padding: 0 20rpx 40rpx;
}

.action-card {
  display: flex;
  padding: 20rpx;

  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .action-icon {
      font-size: 40rpx;
      margin-bottom: 8rpx;
    }

    .action-text {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}
</style>
