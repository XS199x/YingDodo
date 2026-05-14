const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  try {
    if (action === 'getShop') {
      const res = await db.collection('shops').where({ _openid: OPENID }).get()
      return { code: 0, data: res.data[0] || null }
    }

    if (action === 'updateShop') {
      const { data } = event
      const exist = await db.collection('shops').where({ _openid: OPENID }).get()
      if (exist.data.length > 0) {
        await db.collection('shops').doc(exist.data[0]._id).update({
          data: { ...data, updated_at: db.serverDate() }
        })
      } else {
        await db.collection('shops').add({
          data: {
            _openid: OPENID,
            ...data,
            created_at: db.serverDate(),
            updated_at: db.serverDate()
          }
        })
      }
      const res = await db.collection('shops').where({ _openid: OPENID }).get()
      return { code: 0, data: res.data[0] }
    }

    const shopRes = await db.collection('shops').where({ _openid: OPENID }).get()
    let shopInfo = shopRes.data[0] || null

    if (!shopInfo) {
      await db.collection('shops').add({
        data: {
          _openid: OPENID,
          name: '',
          logo: '',
          phone: '',
          address: '',
          wechat_id: '',
          created_at: db.serverDate(),
          updated_at: db.serverDate()
        }
      })
      const newRes = await db.collection('shops').where({ _openid: OPENID }).get()
      shopInfo = newRes.data[0]
    }

    return {
      code: 0,
      data: {
        openid: OPENID,
        shopInfo
      }
    }
  } catch (e) {
    return { code: -1, msg: e.message }
  }
}