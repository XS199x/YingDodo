const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { activityId, templateType } = event

  try {
    const activityRes = await db.collection('activities').doc(activityId).get()
    if (!activityRes.data) {
      return { code: -1, msg: '活动不存在' }
    }
    const activity = activityRes.data

    const shopRes = await db.collection('shops').where({ _openid: OPENID }).get()
    const shop = shopRes.data[0] || {}

    const posterData = {
      shopName: shop.name || '我的店铺',
      shopPhone: shop.phone || '',
      shopAddress: shop.address || '',
      activityTitle: activity.title,
      activityDesc: activity.desc,
      templateType: activity.template_type,
      config: activity.config,
      activityId: activity._id
    }

    return {
      code: 0,
      data: {
        posterData,
        message: '海报数据已准备，请在小程序端使用canvas渲染'
      }
    }
  } catch (e) {
    return { code: -1, msg: e.message }
  }
}