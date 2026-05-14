<template>
  <view class="page-container">
    <view class="search-bar">
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索客户昵称"
        @confirm="searchCustomers"
      />
      <text class="search-btn" @click="searchCustomers">搜索</text>
    </view>

    <view class="stats-bar flex-between">
      <text class="stats-text">共 <text class="text-primary">{{ total }}</text> 位客户</text>
    </view>

    <view class="customer-list">
      <view
        v-for="item in customers"
        :key="item._id"
        class="customer-item card flex-between"
        @click="goDetail(item._id)"
      >
        <view class="flex-row">
          <image
            :src="item.avatar || '/static/images/default-avatar.png'"
            class="customer-avatar"
            mode="aspectFill"
          />
          <view class="customer-info">
            <view class="customer-name">{{ item.nickname || '微信用户' }}</view>
            <view class="customer-time text-sm text-light">
              {{ formatRelative(item.added_at) }} 添加
            </view>
          </view>
        </view>
        <view class="customer-tags">
          <text
            v-for="tag in (item.tags || []).slice(0, 2)"
            :key="tag"
            class="tag tag-primary"
          >{{ tag }}</text>
          <text v-if="(item.tags || []).length > 2" class="tag tag-default">
            +{{ item.tags.length - 2 }}
          </text>
        </view>
      </view>
    </view>

    <view v-if="customers.length === 0 && !loading" class="empty-area">
      <empty-state
        text="还没有客户"
        subtext="创建活动并分享海报，新客户扫码后会自动出现在这里"
      />
    </view>

    <view v-if="hasMore && customers.length > 0" class="load-more">
      <button class="btn-outline btn-sm" @click="loadMore" :disabled="loadingMore">
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getCustomers } from '@/common/api.js'
import { formatRelative } from '@/common/utils.js'
import EmptyState from '@/components/empty-state/empty-state.vue'

export default {
  components: { EmptyState },
  data() {
    return {
      customers: [],
      keyword: '',
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
      loading: false,
      loadingMore: false
    }
  },
  onShow() {
    this.page = 1
    this.loadCustomers()
  },
  methods: {
    formatRelative,
    async loadCustomers() {
      this.loading = true
      try {
        const res = await getCustomers({ keyword: this.keyword, page: this.page, pageSize: this.pageSize })
        if (res.code === 0) {
          if (this.page === 1) {
            this.customers = res.data.list
          } else {
            this.customers = this.customers.concat(res.data.list)
          }
          this.total = res.data.total
          this.hasMore = this.customers.length < res.data.total
        }
      } catch (e) {
        console.error('加载客户失败:', e)
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    searchCustomers() {
      this.page = 1
      this.loadCustomers()
    },
    loadMore() {
      if (this.loadingMore) return
      this.loadingMore = true
      this.page++
      this.loadCustomers()
    },
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/customer/detail?id=${id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: $bg-white;

  .search-input {
    flex: 1;
    height: 68rpx;
    background: $bg-color;
    border-radius: 34rpx;
    padding: 0 24rpx;
    font-size: $font-size-sm;
  }

  .search-btn {
    margin-left: 16rpx;
    font-size: $font-size-base;
    color: $primary-color;
    font-weight: 500;
  }
}

.stats-bar {
  padding: 16rpx 20rpx;

  .stats-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.customer-list {
  padding: 0 20rpx;
}

.customer-item {
  margin-bottom: 12rpx;

  .customer-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: $radius-round;
    margin-right: 20rpx;
    background: $bg-color;
  }

  .customer-info {
    .customer-name {
      font-size: $font-size-base;
      font-weight: 500;
      color: $text-color;
      margin-bottom: 4rpx;
    }
  }

  .customer-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 180rpx;
  }
}

.empty-area {
  padding-top: 100rpx;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 30rpx;

  button {
    width: 240rpx;
  }
}
</style>