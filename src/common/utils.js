export function formatTime(date, fmt = 'YYYY-MM-DD HH:mm') {
  if (!date) return ''
  const d = new Date(date)
  const o = {
    'Y+': d.getFullYear(),
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  }
  for (const k in o) {
    const reg = new RegExp('(' + k + ')')
    if (reg.test(fmt)) {
      fmt = fmt.replace(reg, (match) => {
        const val = String(o[k])
        return match.length === 1 ? val : val.padStart(2, '0')
      })
    }
  }
  return fmt
}

export function formatDate(date) {
  return formatTime(date, 'YYYY-MM-DD')
}

export function formatRelative(date) {
  if (!date) return ''
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return Math.floor(diff / minute) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < 7 * day) return Math.floor(diff / day) + '天前'
  return formatDate(date)
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function throttle(fn, delay = 300) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

export function showToast(title, icon = 'none') {
  uni.showToast({ title, icon, duration: 2000 })
}

export function showLoading(title = '加载中...') {
  uni.showLoading({ title, mask: true })
}

export function hideLoading() {
  uni.hideLoading()
}

export function previewImage(urls, current = 0) {
  uni.previewImage({ urls: Array.isArray(urls) ? urls : [urls], current })
}

export function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: resolve,
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
        reject(err)
      }
    })
  })
}

export function getTemplateConfig(templateType) {
  const templates = {
    new_user_coupon: {
      name: '新人优惠券',
      icon: '/static/images/template-coupon.png',
      desc: '客户扫码领券，自动记录新客',
      fields: [
        { key: 'coupon_name', label: '优惠券名称', type: 'input', placeholder: '如：车厘子立减8元', required: true },
        { key: 'coupon_value', label: '优惠金额（元）', type: 'number', placeholder: '如：8', required: true },
        { key: 'coupon_desc', label: '使用说明', type: 'textarea', placeholder: '如：加好友即可领取，到店出示使用' },
        { key: 'valid_days', label: '有效天数', type: 'number', placeholder: '如：7', required: true }
      ]
    },
    like_gift: {
      name: '集赞有礼',
      icon: '/static/images/template-like.png',
      desc: '发朋友圈集赞，截图返现送礼',
      fields: [
        { key: 'gift_name', label: '礼品名称', type: 'input', placeholder: '如：免费美甲一次', required: true },
        { key: 'like_count', label: '需要集赞数', type: 'number', placeholder: '如：28', required: true },
        { key: 'gift_desc', label: '活动说明', type: 'textarea', placeholder: '如：发朋友圈集满28个赞，截图发给客服即可领取' },
        { key: 'valid_days', label: '有效天数', type: 'number', placeholder: '如：7', required: true }
      ]
    },
    invite_card: {
      name: '老带新邀请卡',
      icon: '/static/images/template-invite.png',
      desc: '老客分享，新客下单双方得优惠',
      fields: [
        { key: 'inviter_reward', label: '邀请人奖励', type: 'input', placeholder: '如：返现10元', required: true },
        { key: 'invitee_reward', label: '新客奖励', type: 'input', placeholder: '如：首单立减5元', required: true },
        { key: 'activity_desc', label: '活动说明', type: 'textarea', placeholder: '如：老客户邀请新客户下单，双方均可获得优惠' },
        { key: 'valid_days', label: '有效天数', type: 'number', placeholder: '如：30', required: true }
      ]
    },
    flash_sale: {
      name: '秒杀/拼团活动',
      icon: '/static/images/template-flash.png',
      desc: '限时优惠活动页，吸引到店',
      fields: [
        { key: 'product_name', label: '商品/服务名称', type: 'input', placeholder: '如：精品车厘子1斤', required: true },
        { key: 'original_price', label: '原价（元）', type: 'number', placeholder: '如：58', required: true },
        { key: 'flash_price', label: '秒杀价（元）', type: 'number', placeholder: '如：29.9', required: true },
        { key: 'limit_count', label: '限量份数', type: 'number', placeholder: '如：50', required: true },
        { key: 'valid_days', label: '有效天数', type: 'number', placeholder: '如：3', required: true }
      ]
    },
    checkin: {
      name: '签到打卡',
      icon: '/static/images/template-checkin.png',
      desc: '连续签到领福利，提升群活跃',
      fields: [
        { key: 'reward_desc', label: '签到奖励', type: 'input', placeholder: '如：连续签到7天送小礼品', required: true },
        { key: 'checkin_days', label: '连续签到天数', type: 'number', placeholder: '如：7', required: true },
        { key: 'activity_desc', label: '活动说明', type: 'textarea', placeholder: '如：每天来店里签到，连续7天即可领取精美礼品一份' }
      ]
    }
  }
  return templates[templateType] || null
}

export const TEMPLATE_TYPES = [
  { key: 'new_user_coupon', name: '新人优惠券', desc: '扫码领券加好友', color: '#FF6B35', icon: '🎫' },
  { key: 'like_gift', name: '集赞有礼', desc: '发圈集赞送好礼', color: '#FF4081', icon: '👍' },
  { key: 'invite_card', name: '老带新邀请卡', desc: '邀请好友双方得利', color: '#536DFE', icon: '💌' },
  { key: 'flash_sale', name: '秒杀活动', desc: '限时优惠吸引到店', color: '#FF5252', icon: '⚡' },
  { key: 'checkin', name: '签到打卡', desc: '连续签到领福利', color: '#00BFA5', icon: '📅' }
]