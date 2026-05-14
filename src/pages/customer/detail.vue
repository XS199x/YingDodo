<template>
  <view class="page-container">
    <view v-if="customer" class="customer-detail">
      <view class="profile-card card text-center">
        <image
          :src="customer.avatar || '/static/images/default-avatar.png'"
          class="profile-avatar"
          mode="aspectFill"
        />
        <view class="profile-name">{{ customer.nickname || '微信用户' }}</view>
        <view class="profile-time text-sm text-light">
          {{ formatDate(customer.added_at) }} 成为你的客户
        </view>
      </view>

      <view class="card">
        <view class="card-title">客户标签</view>
        <view class="tags-area">
          <text
            v-for="tag in customer.tags"
            :key="tag"
            class="tag tag-primary"
            @click="removeTag(tag)"
          >{{ tag }} ✕</text>
          <text
            v-if="(customer.tags || []).length === 0"
            class="text-sm text-light"
          >还没有标签，点击下方添加</text>
        </view>
        <view class="add-tag-area">
          <input
            class="tag-input"
            v-model="newTag"
            placeholder="输入新标签，如：高客单、老客"
            maxlength="10"
            @confirm="addTag"
          />
          <button class="btn-sm btn-primary" @click="addTag">添加</button>
        </view>
      </view>

      <view class="card">
        <view class="card-title">手机号</view>
        <view v-if="customer.phone" class="flex-between">
          <text>{{ customer.phone }}</text>
          <text class="text-sm text-primary" @click="editPhone">修改</text>
        </view>
        <view v-else class="add-phone" @click="editPhone">
          <text class="text-primary">+ 补录手机号</text>
        </view>
      </view>

      <view class="card" v-if="sourceActivity">
        <view class="card-title">来源活动</view>
        <view class="text-sm">{{ sourceActivity.title || '未知活动' }}</view>
      </view>
    </view>

    <empty-state v-else text="客户不存在" />
  </view>
</template>

<script>
import { getCustomerDetail, updateCustomerTags, updateCustomerPhone, getActivityDetail } from '@/common/api.js'
import { formatDate } from '@/common/utils.js'
import EmptyState from '@/components/empty-state/empty-state.vue'

export default {
  components: { EmptyState },
  data() {
    return {
      customer: null,
      customerId: '',
      newTag: '',
      sourceActivity: null
    }
  },
  onLoad(options) {
    this.customerId = options.id
    this.loadDetail()
  },
  methods: {
    formatDate,
    async loadDetail() {
      try {
        const res = await getCustomerDetail(this.customerId)
        if (res.code === 0) {
          this.customer = res.data
          if (this.customer.source_activity_id) {
            this.loadSourceActivity(this.customer.source_activity_id)
          }
        }
      } catch (e) {
        console.error('加载客户详情失败:', e)
      }
    },
    async loadSourceActivity(activityId) {
      try {
        const res = await getActivityDetail(activityId)
        if (res.code === 0) {
          this.sourceActivity = res.data
        }
      } catch (e) {
        console.error('加载来源活动失败:', e)
      }
    },
    async addTag() {
      const tag = this.newTag.trim()
      if (!tag) return
      if ((this.customer.tags || []).includes(tag)) {
        uni.showToast({ title: '标签已存在', icon: 'none' })
        return
      }
      const tags = [...(this.customer.tags || []), tag]
      try {
        const res = await updateCustomerTags(this.customerId, tags)
        if (res.code === 0) {
          this.customer.tags = tags
          this.newTag = ''
          uni.showToast({ title: '标签已添加', icon: 'success' })
        }
      } catch (e) {
        uni.showToast({ title: '添加失败', icon: 'none' })
      }
    },
    async removeTag(tag) {
      const tags = (this.customer.tags || []).filter(t => t !== tag)
      try {
        const res = await updateCustomerTags(this.customerId, tags)
        if (res.code === 0) {
          this.customer.tags = tags
          uni.showToast({ title: '标签已移除', icon: 'success' })
        }
      } catch (e) {
        uni.showToast({ title: '移除失败', icon: 'none' })
      }
    },
    editPhone() {
      uni.showModal({
        title: '补录手机号',
        editable: true,
        placeholderText: '请输入客户手机号',
        success: async (res) => {
          if (res.confirm && res.content) {
            const phone = res.content.trim()
            if (!/^1\d{10}$/.test(phone)) {
              uni.showToast({ title: '手机号格式不正确', icon: 'none' })
              return
            }
            try {
              const apiRes = await updateCustomerPhone(this.customerId, phone)
              if (apiRes.code === 0) {
                this.customer.phone = phone
                uni.showToast({ title: '手机号已保存', icon: 'success' })
              }
            } catch (e) {
              uni.showToast({ title: '保存失败', icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 24rpx;

  .profile-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-round;
    margin-bottom: 16rpx;
    background: $bg-color;
  }

  .profile-name {
    font-size: $font-size-xl;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 8rpx;
  }
}

.tags-area {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;

  .tag {
    cursor: pointer;
  }
}

.add-tag-area {
  display: flex;
  align-items: center;

  .tag-input {
    flex: 1;
    height: 68rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 0 16rpx;
    font-size: $font-size-sm;
    margin-right: 16rpx;
  }

  button {
    flex-shrink: 0;
  }
}

.add-phone {
  padding: 16rpx 0;
}
</style>