<template>
  <view class="page-container">
    <view class="poster-wrapper" v-if="posterReady">
      <view class="poster-tips">长按海报可保存到手机相册</view>
      <canvas
        canvas-id="posterCanvas"
        class="poster-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      />
      <image
        v-if="posterUrl"
        :src="posterUrl"
        class="poster-image"
        mode="widthFix"
        @longpress="savePoster"
      />
    </view>

    <view v-else class="loading-area flex-center">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在生成海报...</text>
        <text class="loading-hint">{{ loadingHint }}</text>
      </view>
    </view>

    <view class="bottom-action" v-if="posterReady">
      <button class="btn-primary" @click="savePoster">保存海报到相册</button>
      <button class="btn-outline" @click="shareActivity" style="margin-top: 20rpx;">分享给好友</button>
    </view>

    <view class="retry-btn" v-if="showRetry">
      <button class="btn-primary" @click="retryGenerate">重新生成海报</button>
    </view>
  </view>
</template>

<script>
import { getActivityDetail, generatePoster } from '@/common/api.js'
import { getTemplateConfig, TEMPLATE_TYPES } from '@/common/utils.js'

export default {
  data() {
    return {
      activityId: '',
      activity: null,
      posterData: null,
      posterUrl: '',
      posterReady: false,
      canvasWidth: 300,
      canvasHeight: 550,
      qrcodeUrl: '',
      loadingHint: '',
      showRetry: false,
      retryCount: 0,
      maxRetries: 3
    }
  },
  onLoad(options) {
    this.activityId = options.activityId
    this.initPoster()
  },
  methods: {
    async initPoster() {
      try {
        this.posterReady = false
        this.showRetry = false
        this.loadingHint = '正在获取活动信息...'

        const detailRes = await getActivityDetail(this.activityId)

        if (detailRes.code === 0) {
          this.activity = detailRes.data
        } else {
          throw new Error('获取活动详情失败')
        }

        this.buildPosterData()
        
        this.loadingHint = '正在生成二维码...'
        await this.generateQrcode()
        
        this.loadingHint = '正在绘制海报...'
        await this.drawPoster()
        
        this.loadingHint = ''
      } catch (e) {
        console.error('生成海报失败:', e)
        this.retryCount++
        
        if (this.retryCount < this.maxRetries) {
          this.loadingHint = `生成失败，正在重试 (${this.retryCount}/${this.maxRetries})...`
          setTimeout(() => {
            this.initPoster()
          }, 2000)
        } else {
          this.loadingHint = ''
          this.posterReady = true
          this.showRetry = true
          uni.showToast({ title: '生成失败，请点击下方按钮重试', icon: 'none', duration: 3000 })
        }
      }
    },
    retryGenerate() {
      this.retryCount = 0
      this.initPoster()
    },
    buildPosterData() {
      const config = this.activity.config || {}
      const displayConfig = {}
      
      const templateInfo = getTemplateConfig(this.activity.template_type) || {}
      const fields = templateInfo.fields || []
      
      fields.forEach(f => {
        if (config[f.key]) {
          displayConfig[f.label] = config[f.key]
        }
      })

      this.posterData = {
        shopName: this.$store.state.shopInfo?.name || '我的店铺',
        activityTitle: this.activity.title || '精彩活动',
        activityDesc: this.activity.desc || '',
        config: displayConfig
      }
    },
    async generateQrcode() {
      return new Promise((resolve, reject) => {
        const sharePath = `/pages/activity/join?activityId=${this.activityId}`
        
        uni.request({
          url: 'https://api.qrserver.com/v1/create-qr-code/',
          method: 'GET',
          data: {
            size: '120x120',
            data: `https://mp.weixin.qq.com/s?__biz=MzI1NjUyMzE4Mg==&mid=2247483647&idx=1&sn=dummy&chksm=ea2f9b88dd5812906f45f366d90b6d30b9f4d2a5c6e7a8d2a4c3e5f6a7b8c9d0&scene=${encodeURIComponent(sharePath)}`
          },
          responseType: 'arraybuffer',
          success: (res) => {
            const base64 = uni.arrayBufferToBase64(res.data)
            this.qrcodeUrl = `data:image/png;base64,${base64}`
            resolve()
          },
          fail: (err) => {
            console.warn('外部二维码生成失败，使用内置方案')
            this.qrcodeUrl = ''
            resolve()
          },
          timeout: 5000
        })
      })
    },
    async drawPoster() {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('海报绘制超时'))
        }, 15000)

        const ctx = uni.createCanvasContext('posterCanvas')
        const w = this.canvasWidth
        const h = this.canvasHeight

        ctx.setFillStyle('#FFFFFF')
        ctx.fillRect(0, 0, w, h)

        ctx.setFillStyle('#FF6B35')
        ctx.fillRect(0, 0, w, 80)

        ctx.setFillStyle('#FFFFFF')
        ctx.setFontSize(20)
        ctx.setTextAlign('center')
        ctx.fillText(this.posterData?.shopName || '我的店铺', w / 2, 50)

        ctx.setFillStyle('#333333')
        ctx.setFontSize(18)
        ctx.setTextAlign('center')
        const title = this.posterData?.activityTitle || '精彩活动'
        ctx.fillText(title.length > 12 ? title.slice(0, 12) + '...' : title, w / 2, 130)

        ctx.setFillStyle('#666666')
        ctx.setFontSize(13)
        const desc = this.posterData?.activityDesc || ''
        if (desc) {
          ctx.fillText(desc.length > 20 ? desc.slice(0, 20) + '...' : desc, w / 2, 160)
        }

        ctx.setStrokeStyle('#EEEEEE')
        ctx.setLineWidth(1)
        ctx.moveTo(30, 190)
        ctx.lineTo(w - 30, 190)
        ctx.stroke()

        const config = this.posterData?.config || {}
        const configKeys = Object.keys(config)
        let yPos = 220
        ctx.setFillStyle('#333333')
        ctx.setFontSize(14)
        ctx.setTextAlign('left')

        configKeys.forEach(key => {
          if (yPos < h - 160) {
            ctx.fillText(`${key}: ${config[key]}`, 30, yPos)
            yPos += 28
          }
        })

        const qrcodeSize = 100
        const qrcodeX = (w - qrcodeSize) / 2
        const qrcodeY = h - 150
        
        if (this.qrcodeUrl) {
          ctx.drawImage(this.qrcodeUrl, qrcodeX, qrcodeY, qrcodeSize, qrcodeSize)
        } else {
          ctx.setFillStyle('#F5F5F5')
          ctx.fillRect(qrcodeX, qrcodeY, qrcodeSize, qrcodeSize)
          ctx.setStrokeStyle('#DDDDDD')
          ctx.setLineWidth(1)
          ctx.strokeRect(qrcodeX, qrcodeY, qrcodeSize, qrcodeSize)
          
          const centerX = qrcodeX + qrcodeSize / 2
          const centerY = qrcodeY + qrcodeSize / 2
          const dotSize = 8
          ctx.setFillStyle('#CCCCCC')
          ctx.fillRect(centerX - dotSize, centerY - dotSize, dotSize * 2, dotSize * 2)
        }

        ctx.setFillStyle('#999999')
        ctx.setFontSize(11)
        ctx.setTextAlign('center')
        ctx.fillText('长按识别二维码参与活动', w / 2, h - 25)

        ctx.draw(false, () => {
          setTimeout(() => {
            uni.canvasToTempFilePath({
              canvasId: 'posterCanvas',
              success: (res) => {
                clearTimeout(timeout)
                this.posterUrl = res.tempFilePath
                this.posterReady = true
                resolve()
              },
              fail: (err) => {
                clearTimeout(timeout)
                console.error('canvasToTempFilePath failed:', err)
                this.posterReady = true
                reject(new Error('生成图片失败'))
              }
            })
          }, 500)
        })
      })
    },
    savePoster() {
      if (!this.posterUrl) {
        uni.showToast({ title: '海报还未生成', icon: 'none' })
        return
      }
      uni.saveImageToPhotosAlbum({
        filePath: this.posterUrl,
        success: () => {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: (err) => {
          if (err.errMsg.includes('auth deny')) {
            uni.showModal({
              title: '提示',
              content: '需要授权保存图片到相册',
              success: (res) => {
                if (res.confirm) {
                  uni.openSetting()
                }
              }
            })
          }
        }
      })
    },
    shareActivity() {
      if (!this.activity) {
        uni.showToast({ title: '活动信息未加载', icon: 'none' })
        return
      }
      
      uni.showActionSheet({
        itemList: ['发送给朋友', '分享到朋友圈'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.shareToFriend()
          } else if (res.tapIndex === 1) {
            this.shareToTimeline()
          }
        }
      })
    },
    shareToFriend() {
      uni.showToast({ title: '请点击右上角分享', icon: 'none', duration: 2000 })
    },
    shareToTimeline() {
      uni.showToast({ title: '请点击右上角分享到朋友圈', icon: 'none', duration: 2000 })
    }
  },
  onShareAppMessage() {
    return {
      title: this.activity?.title || '精彩活动',
      path: `/pages/activity/detail?id=${this.activityId}`,
      imageUrl: this.posterUrl || ''
    }
  },
  onShareTimeline() {
    return {
      title: this.activity?.title || '精彩活动',
      query: `id=${this.activityId}`,
      imageUrl: this.posterUrl || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.poster-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
}

.poster-tips {
  font-size: $font-size-sm;
  color: $text-light;
  margin-bottom: 20rpx;
}

.poster-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}

.poster-image {
  width: 600rpx;
  border-radius: $radius-base;
  box-shadow: $shadow-float;
}

.loading-area {
  height: 700rpx;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #DDDDDD;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: $font-size-base;
  color: $text-light;
  margin-bottom: 10rpx;
}

.loading-hint {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.bottom-action {
  padding: 30rpx 20rpx;
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;
}

.retry-btn {
  padding: 30rpx 20rpx;
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;
}
</style>