<template>
  <view class="page-container">
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else>
      <view class="card">
        <view class="card-title">{{ templateInfo.name }}</view>
        <view class="card-desc">{{ templateInfo.desc }}</view>
      </view>

      <view class="card">
        <view class="card-title">活动信息</view>

        <view class="form-item">
          <view class="form-label">活动标题 <text class="required">*</text></view>
          <input
            class="form-input"
            v-model="form.title"
            placeholder="给你的活动起个名字"
            maxlength="30"
          />
        </view>

        <view class="form-item">
          <view class="form-label">活动描述</view>
          <textarea
            class="form-textarea"
            v-model="form.desc"
            placeholder="简单描述一下活动内容"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <view class="form-label">封面图片</view>
          <view class="upload-area" @click="chooseImage">
            <image v-if="form.cover" :src="form.cover" class="cover-preview" mode="aspectFill" />
            <view v-else class="upload-placeholder">
              <text class="upload-icon">📷</text>
              <text class="upload-text">点击上传封面图</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">有效天数 <text class="required">*</text></view>
          <input
            class="form-input"
            v-model="form.valid_days"
            type="number"
            placeholder="活动持续多少天"
          />
        </view>
      </view>

      <view class="card">
        <view class="card-title">活动配置</view>

        <view v-for="field in templateInfo.fields" :key="field.key" class="form-item">
          <view class="form-label">
            {{ field.label }}
            <text v-if="field.required" class="required">*</text>
          </view>
          <input
            v-if="field.type === 'input' || field.type === 'number'"
            class="form-input"
            v-model="form.config[field.key]"
            :type="field.type === 'number' ? 'number' : 'text'"
            :placeholder="field.placeholder"
          />
          <textarea
            v-if="field.type === 'textarea'"
            class="form-textarea"
            v-model="form.config[field.key]"
            :placeholder="field.placeholder"
            maxlength="200"
          />
        </view>
      </view>

      <view class="bottom-action">
        <button class="btn-primary" @click="submitActivity" :disabled="submitting">
          {{ submitting ? (isEdit ? '保存中...' : '创建中...') : (isEdit ? '保存修改' : '立即创建活动') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getTemplateConfig, formatDate } from '@/common/utils.js'
import { createActivity, updateActivity, getActivityDetail } from '@/common/api.js'

export default {
  data() {
    return {
      templateType: '',
      templateInfo: { name: '', desc: '', fields: [] },
      form: {
        title: '',
        desc: '',
        cover: '',
        valid_days: '7',
        config: {}
      },
      submitting: false,
      loading: false,
      isEdit: false,
      activityId: ''
    }
  },
  onLoad(options) {
    this.activityId = options.id
    this.isEdit = !!options.id

    if (this.isEdit) {
      this.loadActivity()
    } else {
      this.templateType = options.type || 'new_user_coupon'
      this.initForm()
    }
  },
  methods: {
    async loadActivity() {
      this.loading = true
      try {
        const res = await getActivityDetail(this.activityId)
        if (res.code === 0) {
          const activity = res.data
          this.templateType = activity.template_type
          this.templateInfo = getTemplateConfig(this.templateType) || { name: '', desc: '', fields: [] }
          
          const now = new Date()
          const endTime = new Date(activity.end_time)
          const days = Math.ceil((endTime.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
          
          this.form = {
            title: activity.title,
            desc: activity.desc || '',
            cover: activity.cover || '',
            valid_days: Math.max(1, days).toString(),
            config: activity.config || {}
          }
          
          this.templateInfo.fields.forEach(f => {
            if (!this.form.config[f.key]) {
              this.form.config[f.key] = ''
            }
          })
        } else {
          uni.showToast({ title: '加载活动失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '加载活动失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    initForm() {
      this.templateInfo = getTemplateConfig(this.templateType) || { name: '', desc: '', fields: [] }
      this.form.config = {}
      this.templateInfo.fields.forEach(f => {
        this.form.config[f.key] = ''
      })
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempPath = res.tempFilePaths[0]
          uni.showLoading({ title: '上传中...' })
          wx.cloud.uploadFile({
            cloudPath: `covers/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
            filePath: tempPath,
            success: (uploadRes) => {
              this.form.cover = uploadRes.fileID
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
    validate() {
      if (!this.form.title.trim()) {
        uni.showToast({ title: '请输入活动标题', icon: 'none' })
        return false
      }
      if (!this.form.valid_days || parseInt(this.form.valid_days) <= 0) {
        uni.showToast({ title: '请输入有效天数', icon: 'none' })
        return false
      }
      for (const field of this.templateInfo.fields) {
        if (field.required && !this.form.config[field.key]) {
          uni.showToast({ title: `请填写${field.label}`, icon: 'none' })
          return false
        }
      }
      return true
    },
    async submitActivity() {
      if (!this.validate()) return
      if (this.submitting) return

      this.submitting = true
      uni.showLoading({ title: this.isEdit ? '保存中...' : '创建中...' })

      try {
        const now = new Date()
        const endTime = new Date(now.getTime() + parseInt(this.form.valid_days) * 24 * 60 * 60 * 1000)

        const data = {
          title: this.form.title,
          desc: this.form.desc,
          cover: this.form.cover,
          config: this.form.config,
          end_time: endTime
        }

        let res
        if (this.isEdit) {
          res = await updateActivity(this.activityId, data)
        } else {
          data.template_type = this.templateType
          data.start_time = now
          res = await createActivity(data)
        }

        uni.hideLoading()

        if (res.code === 0) {
          const successMsg = this.isEdit ? '修改成功！' : '活动创建成功！'
          uni.showToast({ title: successMsg, icon: 'success' })
          setTimeout(() => {
            if (this.isEdit) {
              uni.navigateBack()
            } else {
              uni.redirectTo({
                url: `/pages/activity/detail?id=${res.data._id}`
              })
            }
          }, 1000)
        } else {
          uni.showToast({ title: res.msg || (this.isEdit ? '修改失败' : '创建失败'), icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: this.isEdit ? '修改失败，请重试' : '创建失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
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
    min-height: 140rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 16rpx 20rpx;
    font-size: $font-size-base;
    color: $text-color;
    box-sizing: border-box;
  }
}

.upload-area {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-base;
  overflow: hidden;
  background: $bg-color;

  .cover-preview {
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
      font-size: 48rpx;
      margin-bottom: 8rpx;
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;

  .loading-text {
    font-size: $font-size-base;
    color: $text-light;
  }
}
</style>