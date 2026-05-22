<template>
  <view class="page-container">
    <view v-if="customer" class="customer-detail">
      <view class="profile-card card">
        <view class="profile-header">
          <image
            :src="customer.avatar || '/static/images/default-avatar.png'"
            class="profile-avatar"
            mode="aspectFill"
          />
          <view class="profile-info">
            <view class="profile-name">{{ customer.nickname || '微信用户' }}</view>
            <view class="profile-time text-sm text-light">
              {{ formatDate(customer.added_at) }} 成为你的客户
            </view>
          </view>
        </view>

        <view class="quick-actions">
          <view class="action-item" @click="sendMessage">
            <view class="action-icon">💬</view>
            <text class="action-text">发消息</text>
          </view>
          <view class="action-item" @click="addToGroup">
            <view class="action-icon">👥</view>
            <text class="action-text">拉进群</text>
          </view>
          <view class="action-item" @click="showTagSelector">
            <view class="action-icon">🏷️</view>
            <text class="action-text">加标签</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">客户标签</view>
        <view class="tags-area">
          <view
            v-for="tag in customer.tags"
            :key="tag"
            class="tag-item tag-primary"
            @click="removeTag(tag)"
          >
            <text class="tag-text">{{ tag }}</text>
            <text class="tag-remove">✕</text>
          </view>
          <view
            v-if="(customer.tags || []).length === 0"
            class="empty-tags"
          >
            <text class="text-sm text-light">还没有标签</text>
          </view>
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
        <view class="activity-info">
          <text class="activity-title">{{ sourceActivity.title || '未知活动' }}</text>
          <view class="activity-stats">
            <text class="stat-item">参与时间：{{ formatDate(sourceActivity.created_at) }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">互动记录</view>
        <view class="interaction-list">
          <view v-for="(record, index) in interactionRecords" :key="index" class="interaction-item">
            <view class="interaction-icon">{{ record.icon }}</view>
            <view class="interaction-content">
              <text class="interaction-title">{{ record.title }}</text>
              <text class="interaction-time text-sm text-light">{{ formatRelative(record.time) }}</text>
            </view>
          </view>
          <view v-if="interactionRecords.length === 0" class="empty-interaction">
            <text class="text-sm text-light">暂无互动记录</text>
          </view>
        </view>
      </view>
    </view>

    <empty-state v-else text="客户不存在" />

    <view v-if="showTagModal" class="modal-overlay" @click="showTagModal = false">
      <view class="tag-modal" @click.stop>
        <view class="modal-header flex-between">
          <text class="modal-title">选择标签</text>
          <text class="modal-close" @click="showTagModal = false">✕</text>
        </view>
        <view class="modal-content">
          <view class="preset-tags">
            <text class="tags-label">常用标签</text>
            <view class="tags-grid">
              <view
                v-for="tag in presetTags"
                :key="tag"
                class="preset-tag"
                :class="{ selected: selectedTags.includes(tag) }"
                @click="togglePresetTag(tag)"
              >{{ tag }}</view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-primary" @click="confirmTags">确认添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getCustomerDetail, updateCustomerTags, updateCustomerPhone, getActivityDetail } from '@/common/api.js'
import { formatDate, formatRelative } from '@/common/utils.js'
import EmptyState from '@/components/empty-state/empty-state.vue'

export default {
  components: { EmptyState },
  data() {
    return {
      customer: null,
      customerId: '',
      newTag: '',
      sourceActivity: null,
      interactionRecords: [],
      showTagModal: false,
      selectedTags: [],
      presetTags: ['高客单', '老客', '新客', '意向客户', 'VIP', '待跟进', '已转化', '潜在客户']
    }
  },
  onLoad(options) {
    this.customerId = options.id
    this.loadDetail()
  },
  methods: {
    formatDate,
    formatRelative,
    async loadDetail() {
      try {
        const res = await getCustomerDetail(this.customerId)
        if (res.code === 0) {
          this.customer = res.data
          this.selectedTags = [...(this.customer.tags || [])]
          if (this.customer.source_activity_id) {
            this.loadSourceActivity(this.customer.source_activity_id)
          }
        }
        this.loadInteractionRecords()
      } catch (e) {
        console.error('加载客户详情失败:', e)
      }
    },
    loadInteractionRecords() {
      this.interactionRecords = [
        { icon: '🎯', title: '参与活动', time: Date.now() - 86400000 },
        { icon: '💬', title: '发送欢迎消息', time: Date.now() - 86400000 * 2 }
      ]
    },
    sendMessage() {
      uni.showToast({
        title: '请在微信中发送消息',
        icon: 'none'
      })
    },
    addToGroup() {
      uni.showActionSheet({
        itemList: ['微信群A', '微信群B', '微信群C'],
        success: (res) => {
          uni.showToast({
            title: `已邀请加入微信群${['A', 'B', 'C'][res.tapIndex]}`,
            icon: 'success'
          })
        }
      })
    },
    showTagSelector() {
      this.selectedTags = [...(this.customer.tags || [])]
      this.showTagModal = true
    },
    togglePresetTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tag)
      }
    },
    async confirmTags() {
      try {
        const res = await updateCustomerTags(this.customerId, this.selectedTags)
        if (res.code === 0) {
          this.customer.tags = this.selectedTags
          this.showTagModal = false
          uni.showToast({ title: '标签已更新', icon: 'success' })
        }
      } catch (e) {
        uni.showToast({ title: '更新失败', icon: 'none' })
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
  padding: 30rpx;

  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .profile-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-round;
      margin-right: 20rpx;
      background: $bg-color;
    }

    .profile-info {
      flex: 1;

      .profile-name {
        font-size: $font-size-xl;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 8rpx;
      }
    }
  }

  .quick-actions {
    display: flex;
    border-top: 1rpx solid $bg-color;
    padding-top: 20rpx;

    .action-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 0;

      .action-icon {
        font-size: 48rpx;
        margin-bottom: 8rpx;
      }

      .action-text {
        font-size: $font-size-sm;
        color: $text-secondary;
      }

      &:active {
        opacity: 0.6;
      }
    }
  }
}

.tags-area {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;

  .tag-item {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    margin-right: 12rpx;
    margin-bottom: 12rpx;
    font-size: $font-size-xs;

    &.tag-primary {
      background: #FFF5F0;
      color: $primary-color;
    }

    .tag-text {
      margin-right: 8rpx;
    }

    .tag-remove {
      font-size: $font-size-xs;
      opacity: 0.6;
    }
  }

  .empty-tags {
    padding: 20rpx 0;
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

.activity-info {
  .activity-title {
    display: block;
    font-size: $font-size-base;
    color: $text-color;
    margin-bottom: 8rpx;
  }

  .activity-stats {
    .stat-item {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }
}

.interaction-list {
  .interaction-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $bg-color;

    &:last-child {
      border-bottom: none;
    }

    .interaction-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
    }

    .interaction-content {
      flex: 1;

      .interaction-title {
        display: block;
        font-size: $font-size-sm;
        color: $text-color;
        margin-bottom: 4rpx;
      }
    }
  }

  .empty-interaction {
    padding: 40rpx 0;
    text-align: center;
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
  align-items: flex-end;
  z-index: 1000;
}

.tag-modal {
  width: 100%;
  background: $bg-white;
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;

  .modal-header {
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
    }
  }

  .modal-content {
    padding: 24rpx;
    max-height: 500rpx;
    overflow-y: auto;

    .preset-tags {
      .tags-label {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: 16rpx;
      }

      .tags-grid {
        display: flex;
        flex-wrap: wrap;

        .preset-tag {
          padding: 12rpx 24rpx;
          background: $bg-color;
          border-radius: 30rpx;
          font-size: $font-size-sm;
          color: $text-secondary;
          margin-right: 12rpx;
          margin-bottom: 12rpx;

          &.selected {
            background: rgba($primary-color, 0.1);
            color: $primary-color;
          }
        }
      }
    }
  }

  .modal-footer {
    padding: 20rpx 24rpx;
    border-top: 1rpx solid $bg-color;
  }
}
</style>