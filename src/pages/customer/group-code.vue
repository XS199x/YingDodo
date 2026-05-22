<template>
  <view class="page-container">
    <view class="header-action">
      <button class="btn-primary" @click="showCreateModal = true">+ 创建活码</button>
    </view>

    <view v-if="codeList.length === 0" class="empty-state">
      <text class="empty-icon">📱</text>
      <text class="empty-text">还没有群活码</text>
      <text class="empty-subtext">创建活码后可以自动切换微信群二维码</text>
    </view>

    <view v-else class="code-list">
      <view v-for="code in codeList" :key="code.id" class="code-card card">
        <view class="code-header flex-between">
          <view>
            <text class="code-name">{{ code.name }}</text>
            <text class="code-desc">{{ code.groupCount }} 个微信群 · {{ code.scanCount }} 次扫码</text>
          </view>
          <view class="code-status" :class="code.status">
            {{ code.status === 'active' ? '使用中' : '已停用' }}
          </view>
        </view>

        <view class="code-content">
          <view class="qrcode-placeholder">
            <image v-if="code.qrcodeUrl" :src="code.qrcodeUrl" mode="widthFix" class="qrcode-img" />
            <text v-else class="qrcode-icon">📷</text>
          </view>
          <view class="code-info">
            <view class="info-row">
              <text class="info-label">当前群</text>
              <text class="info-value">第 {{ code.currentIndex + 1 }} / {{ code.groupCount }} 个</text>
            </view>
            <view class="info-row">
              <text class="info-label">触发方式</text>
              <text class="info-value">{{ code.triggerType === 'count' ? '按人数' : '按时间' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">切换阈值</text>
              <text class="info-value">{{ code.threshold }} {{ code.triggerType === 'count' ? '人/群' : '小时' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">创建时间</text>
              <text class="info-value">{{ formatDate(code.createdAt) }}</text>
            </view>
          </view>
        </view>

        <view class="code-actions">
          <button class="btn-sm btn-outline" @click="editCode(code)">编辑</button>
          <button 
            class="btn-sm" 
            :class="code.status === 'active' ? 'btn-warning' : 'btn-success'"
            @click="toggleStatus(code)"
          >{{ code.status === 'active' ? '停用' : '启用' }}</button>
          <button class="btn-sm btn-primary" @click="downloadCode(code)">下载</button>
        </view>
      </view>
    </view>

    <view class="modal-overlay" v-if="showCreateModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingCode ? '编辑活码' : '创建群活码' }}</text>
          <text class="modal-close" @click="closeModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">活码名称</text>
            <input 
              class="form-input" 
              v-model="formData.name" 
              placeholder="请输入活码名称"
            />
          </view>

          <view class="form-item">
            <text class="form-label">触发方式</text>
            <view class="radio-group">
              <view 
                class="radio-item" 
                :class="{ active: formData.triggerType === 'count' }"
                @click="formData.triggerType = 'count'"
              >
                <view class="radio-dot"></view>
                <text>按人数</text>
              </view>
              <view 
                class="radio-item" 
                :class="{ active: formData.triggerType === 'time' }"
                @click="formData.triggerType = 'time'"
              >
                <view class="radio-dot"></view>
                <text>按时间</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">切换阈值</text>
            <view class="threshold-input">
              <input 
                class="form-input short" 
                type="number" 
                v-model="formData.threshold" 
                placeholder="阈值"
              />
              <text class="threshold-unit">{{ formData.triggerType === 'count' ? '人/群' : '小时' }}</text>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">微信群二维码</text>
            <text class="form-hint">请上传微信群二维码图片，支持多个</text>
            <view class="upload-area">
              <view 
                v-for="(img, index) in formData.images" 
                :key="index" 
                class="upload-item"
              >
                <image :src="img" mode="aspectFill" class="upload-img" />
                <text class="upload-remove" @click="removeImage(index)">✕</text>
              </view>
              <view class="upload-add" @click="uploadImage">
                <text class="add-icon">+</text>
                <text class="add-text">添加图片</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-outline" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveCode">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive } from 'vue'

const MOCK_CODES = [
  {
    id: '1',
    name: '客户交流群',
    qrcodeUrl: '',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=WeChat%20group%20QR%20code%20simple%20design&image_size=square'],
    groupCount: 3,
    currentIndex: 0,
    scanCount: 1256,
    triggerType: 'count',
    threshold: 200,
    status: 'active',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: '2',
    name: 'VIP会员群',
    qrcodeUrl: '',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=VIP%20membership%20QR%20code%20luxury%20gold&image_size=square'],
    groupCount: 2,
    currentIndex: 1,
    scanCount: 523,
    triggerType: 'count',
    threshold: 100,
    status: 'active',
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: '3',
    name: '活动临时群',
    qrcodeUrl: '',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=temporary%20event%20QR%20code%20colorful&image_size=square'],
    groupCount: 1,
    currentIndex: 0,
    scanCount: 89,
    triggerType: 'time',
    threshold: 24,
    status: 'inactive',
    createdAt: Date.now() - 86400000 * 14
  }
]

export default {
  setup() {
    const codeList = ref(MOCK_CODES)
    const showCreateModal = ref(false)
    const editingCode = ref(null)
    
    const formData = reactive({
      name: '',
      triggerType: 'count',
      threshold: 200,
      images: []
    })

    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${month}-${day}`
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingCode.value = null
      formData.name = ''
      formData.triggerType = 'count'
      formData.threshold = 200
      formData.images = []
    }

    const editCode = (code) => {
      editingCode.value = code
      formData.name = code.name
      formData.triggerType = code.triggerType
      formData.threshold = code.threshold
      formData.images = [...code.images]
      showCreateModal.value = true
    }

    const toggleStatus = (code) => {
      code.status = code.status === 'active' ? 'inactive' : 'active'
      uni.showToast({
        title: code.status === 'active' ? '已启用' : '已停用',
        icon: 'success'
      })
    }

    const downloadCode = (code) => {
      uni.showToast({
        title: '下载功能开发中',
        icon: 'none'
      })
    }

    const uploadImage = () => {
      uni.chooseImage({
        count: 9 - formData.images.length,
        success: (res) => {
          formData.images.push(...res.tempFilePaths)
        }
      })
    }

    const removeImage = (index) => {
      formData.images.splice(index, 1)
    }

    const saveCode = () => {
      if (!formData.name.trim()) {
        uni.showToast({
          title: '请输入活码名称',
          icon: 'none'
        })
        return
      }
      if (formData.images.length === 0) {
        uni.showToast({
          title: '请至少上传一张二维码',
          icon: 'none'
        })
        return
      }

      if (editingCode.value) {
        editingCode.value.name = formData.name
        editingCode.value.triggerType = formData.triggerType
        editingCode.value.threshold = formData.threshold
        editingCode.value.images = [...formData.images]
        editingCode.value.groupCount = formData.images.length
        uni.showToast({
          title: '修改成功',
          icon: 'success'
        })
      } else {
        const newCode = {
          id: Date.now().toString(),
          name: formData.name,
          qrcodeUrl: '',
          images: [...formData.images],
          groupCount: formData.images.length,
          currentIndex: 0,
          scanCount: 0,
          triggerType: formData.triggerType,
          threshold: formData.threshold,
          status: 'active',
          createdAt: Date.now()
        }
        codeList.value.unshift(newCode)
        uni.showToast({
          title: '创建成功',
          icon: 'success'
        })
      }

      closeModal()
    }

    return {
      codeList,
      showCreateModal,
      editingCode,
      formData,
      formatDate,
      closeModal,
      editCode,
      toggleStatus,
      downloadCode,
      uploadImage,
      removeImage,
      saveCode
    }
  }
}
</script>

<style lang="scss" scoped>
.header-action {
  padding: 20rpx;
  background: $bg-white;

  button {
    width: 100%;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: $font-size-lg;
    color: $text-color;
    margin-bottom: 12rpx;
  }

  .empty-subtext {
    font-size: $font-size-sm;
    color: $text-light;
    text-align: center;
  }
}

.code-list {
  padding: 20rpx;
}

.code-card {
  margin-bottom: 20rpx;

  .code-header {
    margin-bottom: 20rpx;

    .code-name {
      display: block;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 6rpx;
    }

    .code-desc {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    .code-status {
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-size: $font-size-xs;

      &.active {
        background: rgba($success-color, 0.1);
        color: $success-color;
      }

      &.inactive {
        background: rgba($text-light, 0.1);
        color: $text-light;
      }
    }
  }

  .code-content {
    display: flex;
    background: $bg-color;
    padding: 20rpx;
    border-radius: $radius-base;
    margin: 0 -24rpx;

    .qrcode-placeholder {
      width: 160rpx;
      height: 160rpx;
      background: $bg-white;
      border-radius: $radius-sm;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;

      .qrcode-img {
        width: 100%;
        height: 100%;
        border-radius: $radius-sm;
      }

      .qrcode-icon {
        font-size: 48rpx;
      }
    }

    .code-info {
      flex: 1;

      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-size: $font-size-sm;
          color: $text-light;
        }

        .info-value {
          font-size: $font-size-sm;
          color: $text-color;
        }
      }
    }
  }

  .code-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;

    button {
      flex: 1;
      height: 72rpx;
      font-size: $font-size-sm;
    }
  }
}

.btn-warning {
  background: rgba($warning-color, 0.1);
  color: $warning-color;
  border: 2rpx solid $warning-color;
}

.btn-success {
  background: rgba($success-color, 0.1);
  color: $success-color;
  border: 2rpx solid $success-color;
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

  .modal-content {
    width: 100%;
    max-height: 80vh;
    background: $bg-white;
    border-radius: $radius-lg $radius-lg 0 0;
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
      padding: 24rpx;
      max-height: 60vh;
      overflow-y: auto;

      .form-item {
        margin-bottom: 24rpx;

        .form-label {
          display: block;
          font-size: $font-size-sm;
          color: $text-color;
          margin-bottom: 12rpx;
        }

        .form-hint {
          display: block;
          font-size: $font-size-xs;
          color: $text-light;
          margin-bottom: 12rpx;
        }

        .form-input {
          width: 100%;
          height: 80rpx;
          padding: 0 20rpx;
          background: $bg-color;
          border-radius: $radius-base;
          font-size: $font-size-base;

          &.short {
            width: 200rpx;
          }
        }

        .radio-group {
          display: flex;
          gap: 30rpx;

          .radio-item {
            display: flex;
            align-items: center;

            .radio-dot {
              width: 32rpx;
              height: 32rpx;
              border: 2rpx solid #DDDDDD;
              border-radius: 50%;
              margin-right: 12rpx;
              position: relative;

              &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 16rpx;
                height: 16rpx;
                background: $primary-color;
                border-radius: 50%;
                opacity: 0;
              }
            }

            text {
              font-size: $font-size-base;
              color: $text-color;
            }

            &.active {
              .radio-dot {
                border-color: $primary-color;

                &::after {
                  opacity: 1;
                }
              }
            }
          }
        }

        .threshold-input {
          display: flex;
          align-items: center;
          gap: 16rpx;

          .threshold-unit {
            font-size: $font-size-base;
            color: $text-secondary;
          }
        }

        .upload-area {
          display: flex;
          flex-wrap: wrap;
          gap: 16rpx;

          .upload-item {
            position: relative;
            width: 160rpx;
            height: 160rpx;

            .upload-img {
              width: 100%;
              height: 100%;
              border-radius: $radius-sm;
            }

            .upload-remove {
              position: absolute;
              top: -12rpx;
              right: -12rpx;
              width: 40rpx;
              height: 40rpx;
              background: #FF4757;
              color: #FFFFFF;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: $font-size-sm;
            }
          }

          .upload-add {
            width: 160rpx;
            height: 160rpx;
            border: 2rpx dashed #DDDDDD;
            border-radius: $radius-sm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .add-icon {
              font-size: 48rpx;
              color: $text-light;
              margin-bottom: 8rpx;
            }

            .add-text {
              font-size: $font-size-xs;
              color: $text-light;
            }
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      padding: 20rpx 24rpx;
      gap: 16rpx;
      border-top: 1rpx solid $bg-color;
      padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

      button {
        flex: 1;
        height: 88rpx;
      }
    }
  }
}
</style>