<template>
  <view class="page-container">
    <view class="page-header">
      <text class="page-title">标签管理</text>
      <text class="add-btn" @click="showAddTag">+ 新建标签</text>
    </view>

    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-num">{{ tagGroups.length }}</text>
        <text class="stat-label">标签组</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ totalTags }}</text>
        <text class="stat-label">标签总数</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ totalUsed }}</text>
        <text class="stat-label">已使用</text>
      </view>
    </view>

    <view class="tag-groups">
      <view v-for="group in tagGroups" :key="group.name" class="tag-group">
        <view class="group-header flex-between">
          <view class="flex-row">
            <view class="group-icon" :style="{ backgroundColor: group.color }"></view>
            <text class="group-name">{{ group.name }}</text>
            <text class="group-count">({{ group.tags.length }})</text>
          </view>
          <text class="group-action" @click="editGroup(group)">编辑</text>
        </view>
        <view class="group-tags">
          <view
            v-for="tag in group.tags"
            :key="tag.id"
            class="tag-item"
            :class="{ selected: selectedTags.includes(tag.id) }"
            @click="toggleTag(tag)"
          >
            <text class="tag-name">{{ tag.name }}</text>
            <text class="tag-count">{{ tag.count || 0 }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="tagGroups.length === 0" class="empty-area">
      <view class="empty-icon">🏷️</view>
      <text class="empty-text">还没有标签</text>
      <text class="empty-subtext">点击右上角创建标签，方便管理客户</text>
    </view>

    <view class="add-tag-modal" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header flex-between">
          <text class="modal-title">{{ isEdit ? '编辑标签' : '新建标签' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">标签名称</text>
            <input
              class="form-input"
              v-model="tagForm.name"
              placeholder="请输入标签名称"
            />
          </view>
          <view class="form-item">
            <text class="form-label">标签分组</text>
            <picker mode="selector" :range="groupOptions" @change="onGroupChange">
              <view class="form-picker">
                {{ tagForm.group || '选择分组' }}
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">标签颜色</text>
            <view class="color-picker">
              <view
                v-for="color in colorOptions"
                :key="color"
                class="color-item"
                :class="{ active: tagForm.color === color }"
                :style="{ backgroundColor: color }"
                @click="tagForm.color = color"
              ></view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-outline" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveTag">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { reactive } from 'vue'

const DEFAULT_TAG_GROUPS = [
  {
    name: '来源渠道',
    color: '#FF6B6B',
    tags: [
      { id: 'channel_poster', name: '海报扫码', count: 15 },
      { id: 'channel_friend', name: '好友推荐', count: 8 },
      { id: 'channel_timeline', name: '朋友圈', count: 12 },
      { id: 'channel_search', name: '搜索', count: 5 }
    ]
  },
  {
    name: '客户类型',
    color: '#4ECDC4',
    tags: [
      { id: 'type_new', name: '新客户', count: 20 },
      { id: 'type_old', name: '老客户', count: 15 },
      { id: 'type_vip', name: 'VIP客户', count: 8 },
      { id: 'type_potential', name: '潜在客户', count: 10 }
    ]
  },
  {
    name: '活跃度',
    color: '#45B7D1',
    tags: [
      { id: 'active_high', name: '高活跃', count: 12 },
      { id: 'active_medium', name: '中等', count: 18 },
      { id: 'active_low', name: '低活跃', count: 10 },
      { id: 'active_sleep', name: '沉睡', count: 8 }
    ]
  },
  {
    name: '消费能力',
    color: '#96CEB4',
    tags: [
      { id: 'spend_high', name: '高消费', count: 5 },
      { id: 'spend_medium', name: '中等', count: 18 },
      { id: 'spend_low', name: '低消费', count: 20 }
    ]
  }
]

const COLOR_OPTIONS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
]

export default {
  data() {
    return {
      tagGroups: DEFAULT_TAG_GROUPS,
      selectedTags: [],
      showModal: false,
      isEdit: false,
      tagForm: reactive({
        name: '',
        group: '',
        color: '#FF6B6B'
      }),
      colorOptions: COLOR_OPTIONS,
      groupOptions: ['来源渠道', '客户类型', '活跃度', '消费能力', '自定义']
    }
  },
  computed: {
    totalTags() {
      return this.tagGroups.reduce((sum, group) => sum + group.tags.length, 0)
    },
    totalUsed() {
      return this.tagGroups.reduce((sum, group) => {
        return sum + group.tags.reduce((tagSum, tag) => tagSum + (tag.count || 0), 0)
      }, 0)
    }
  },
  methods: {
    showAddTag() {
      this.isEdit = false
      this.tagForm.name = ''
      this.tagForm.group = ''
      this.tagForm.color = '#FF6B6B'
      this.showModal = true
    },
    editGroup(group) {
      uni.showToast({ title: '编辑分组功能开发中', icon: 'none' })
    },
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag.id)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tag.id)
      }
    },
    onGroupChange(e) {
      this.tagForm.group = this.groupOptions[e.detail.value]
    },
    closeModal() {
      this.showModal = false
    },
    saveTag() {
      if (!this.tagForm.name.trim()) {
        uni.showToast({ title: '请输入标签名称', icon: 'none' })
        return
      }
      
      if (!this.tagForm.group) {
        uni.showToast({ title: '请选择分组', icon: 'none' })
        return
      }

      const group = this.tagGroups.find(g => g.name === this.tagForm.group)
      if (group) {
        group.tags.push({
          id: `tag_${Date.now()}`,
          name: this.tagForm.name,
          count: 0
        })
      }

      uni.showToast({ title: '保存成功', icon: 'success' })
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 20rpx;
  background: $bg-white;

  .page-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-color;
  }

  .add-btn {
    font-size: $font-size-base;
    color: $primary-color;
    font-weight: 500;
  }
}

.stats-row {
  display: flex;
  padding: 24rpx 20rpx;
  background: $bg-white;
  margin-top: 12rpx;

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-num {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: $primary-color;
    }

    .stat-label {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

.tag-groups {
  padding: 12rpx 20rpx;
}

.tag-group {
  background: $bg-white;
  border-radius: $radius-base;
  padding: 20rpx;
  margin-bottom: 12rpx;

  .group-header {
    margin-bottom: 16rpx;

    .group-icon {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      margin-right: 12rpx;
    }

    .group-name {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color;
    }

    .group-count {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-left: 4rpx;
    }

    .group-action {
      font-size: $font-size-sm;
      color: $primary-color;
    }
  }

  .group-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background: $bg-color;
  border-radius: 20rpx;
  transition: all 0.3s;

  &.selected {
    background: rgba($primary-color, 0.1);
    
    .tag-name {
      color: $primary-color;
    }
  }

  .tag-name {
    font-size: $font-size-sm;
    color: $text-color;
  }

  .tag-count {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-left: 8rpx;
    opacity: 0.6;
  }
}

.empty-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: $font-size-base;
    color: $text-color;
    margin-bottom: 8rpx;
  }

  .empty-subtext {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.add-tag-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;

  .modal-content {
    width: 100%;
    background: $bg-white;
    border-radius: $radius-lg $radius-lg 0 0;
    padding-bottom: $safe-bottom;
    padding-bottom: $safe-bottom-env;
  }

  .modal-header {
    padding: 24rpx;
    border-bottom: 1rpx solid #DDDDDD;

    .modal-title {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color;
    }

    .modal-close {
      font-size: 40rpx;
      color: $text-secondary;
      line-height: 1;
    }
  }

  .modal-body {
    padding: 24rpx;
  }

  .form-item {
    margin-bottom: 24rpx;

    .form-label {
      display: block;
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-bottom: 12rpx;
    }

    .form-input {
      width: 100%;
      height: 80rpx;
      background: $bg-color;
      border-radius: $radius-base;
      padding: 0 20rpx;
      font-size: $font-size-base;
    }

    .form-picker {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 80rpx;
      background: $bg-color;
      border-radius: $radius-base;
      padding: 0 20rpx;
      font-size: $font-size-base;
      color: $text-color;

      .picker-arrow {
        font-size: $font-size-lg;
        color: $text-secondary;
      }
    }
  }

  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .color-item {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      transition: all 0.3s;

      &.active {
        transform: scale(1.2);
        box-shadow: 0 0 0 4rpx rgba($primary-color, 0.2);
      }
    }
  }

  .modal-footer {
    display: flex;
    padding: 20rpx 24rpx;
    gap: 20rpx;

    button {
      flex: 1;
      height: 80rpx;
    }
  }
}
</style>