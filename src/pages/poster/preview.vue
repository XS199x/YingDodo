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
      <text>正在生成海报...</text>
    </view>

    <view class="bottom-action">
      <button class="btn-primary" @click="savePoster">保存海报到相册</button>
      <button class="btn-outline" @click="shareActivity" style="margin-top: 20rpx;">分享给好友</button>
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
      canvasHeight: 500
    }
  },
  onLoad(options) {
    this.activityId = options.activityId
    this.initPoster()
  },
  methods: {
    async initPoster() {
      try {
        uni.showLoading({ title: '生成海报中...' })

        const [detailRes, posterRes] = await Promise.all([
          getActivityDetail(this.activityId),
          generatePoster(this.activityId)
        ])

        if (detailRes.code === 0) {
          this.activity = detailRes.data
        }
        if (posterRes.code === 0) {
          this.posterData = posterRes.data.posterData
        }

        await this.drawPoster()
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '生成失败，请重试', icon: 'none' })
      }
    },
    async drawPoster() {
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
        if (yPos < h - 100) {
          ctx.fillText(`${key}: ${config[key]}`, 30, yPos)
          yPos += 28
        }
      })

      ctx.setFillStyle('#FF6B35')
      ctx.fillRect(30, h - 70, w - 60, 40)

      ctx.setFillStyle('#FFFFFF')
      ctx.setFontSize(16)
      ctx.setTextAlign('center')
      ctx.fillText('扫码参与活动', w / 2, h - 42)

      ctx.setFillStyle('#999999')
      ctx.setFontSize(11)
      ctx.fillText('长按识别二维码 · 了解更多', w / 2, h - 15)

      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'posterCanvas',
            success: (res) => {
              this.posterUrl = res.tempFilePath
              this.posterReady = true
            },
            fail: () => {
              this.posterReady = true
            }
          })
        }, 500)
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
  height: 600rpx;
  font-size: $font-size-base;
  color: $text-light;
}

.bottom-action {
  padding: 30rpx 20rpx;
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;
}
</style>