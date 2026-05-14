<template>
  <view class="page-container">
    <view class="card">
      <view class="card-title">店铺信息</view>
      <view class="card-desc">设置后会自动出现在所有海报和活动页底部</view>
    </view>

    <view class="card">
      <view class="form-item">
        <view class="form-label">店铺Logo</view>
        <view class="upload-area" @click="chooseLogo">
          <image v-if="form.logo" :src="form.logo" class="logo-preview" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">上传Logo</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">店铺名称 <text class="required">*</text></view>
        <input
          class="form-input"
          v-model="form.name"
          placeholder="如：张姐鲜果园"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <view class="form-label">联系电话</view>
        <input
          class="form-input"
          v-model="form.phone"
          type="number"
          placeholder="客户联系你的电话"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <view class="form-label">微信号</view>
        <input
          class="form-input"
          v-model="form.wechat_id"
          placeholder="方便客户加你微信"
          maxlength="30"
        />
      </view>

      <view class="form-item">
        <view class="form-label">店铺地址</view>
        <textarea
          class="form-textarea"
          v-model="form.address"
          placeholder="客户能找到你的地址"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <view class="form-label">微信群二维码</view>
        <view class="upload-area" @click="chooseGroupQR">
          <image v-if="form.group_qr" :src="form.group_qr" class="logo-preview" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📱</text>
            <text class="upload-text">上传群二维码</text>
          </view>
        </view>
        <text class="form-tips">客户扫码后可直接加入微信群</text>
      </view>
    </view>

    <view class="bottom-action">
      <button class="btn-primary" @click="saveConfig" :disabled="saving">
        {{ saving ? '保存中...' : '保存设置' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getShopConfig, updateShopConfig } from '@/common/api.js'

export default {
  data() {
    return {
      form: {
        name: '',
        logo: '',
        phone: '',
        wechat_id: '',
        address: '',
        group_qr: ''
      },
      saving: false
    }
  },
  onLoad() {
    this.loadConfig()
  },
  methods: {
    async loadConfig() {
      try {
        const res = await getShopConfig()
        if (res.code === 0 && res.data) {
          this.form = {
            name: res.data.name || '',
            logo: res.data.logo || '',
            phone: res.data.phone || '',
            wechat_id: res.data.wechat_id || '',
            address: res.data.address || '',
            group_qr: res.data.group_qr || ''
          }
        }
      } catch (e) {
        console.error('加载店铺配置失败:', e)
      }
    },
    chooseLogo() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempPath = res.tempFilePaths[0]
          uni.showLoading({ title: '上传中...' })
          wx.cloud.uploadFile({
            cloudPath: `logos/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
            filePath: tempPath,
            success: (uploadRes) => {
              this.form.logo = uploadRes.fileID
              uni.hideLoading()
            },
            fail: () => {
              uni.hideLoading()
              uni.showToast({ title: '上传失败，请重试', icon: 'none' })
            }
          })
        }
      })
    },
    chooseGroupQR() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempPath = res.tempFilePaths[0]
          uni.showLoading({ title: '上传中...' })
          wx.cloud.uploadFile({
            cloudPath: `group_qr/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
            filePath: tempPath,
            success: (uploadRes) => {
              this.form.group_qr = uploadRes.fileID
              uni.hideLoading()
            },
            fail: () => {
              uni.hideLoading()
              uni.showToast({ title: '上传失败，请重试', icon: 'none' })
            }
          })
        }
      })
    },
    async saveConfig() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入店铺名称', icon: 'none' })
        return
      }
      if (this.saving) return

      this.saving = true
      uni.showLoading({ title: '保存中...' })

      try {
        const res = await updateShopConfig(this.form)
        uni.hideLoading()

        if (res.code === 0) {
          this.$store.commit('SET_SHOP_INFO', res.data)
          uni.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        } else {
          uni.showToast({ title: res.msg || '保存失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  margin-bottom: 28rpx;

  .form-label {
    font-size: $font-size-base;
    font-weight: 500;
    color: $text-color;
    margin-bottom: 12rpx;

    .required {
      color: $danger-color;
    }
  }

  .form-input {
    height: 80rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 0 20rpx;
    font-size: $font-size-base;
    color: $text-color;
  }

  .form-textarea {
    width: 100%;
    min-height: 120rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 16rpx 20rpx;
    font-size: $font-size-base;
    color: $text-color;
    box-sizing: border-box;
  }

  .form-tips {
    display: block;
    font-size: $font-size-xs;
    color: $text-light;
    margin-top: 8rpx;
  }
}

.upload-area {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-base;
  overflow: hidden;
  background: $bg-color;

  .logo-preview {
    width: 100%;
    height: 100%;
  }

  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed $border-color;
    border-radius: $radius-base;

    .upload-icon {
      font-size: 40rpx;
      margin-bottom: 6rpx;
    }

    .upload-text {
      font-size: $font-size-xs;
      color: $text-light;
    }
  }
}

.bottom-action {
  padding: 30rpx 20rpx;
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;
}
</style>