const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, id, tags, phone, keyword, page = 1, pageSize = 20 } = event

  try {
    switch (action) {
      case 'list': {
        const query = { _openid: OPENID }
        if (keyword) {
          query.nickname = db.RegExp({ regexp: keyword, options: 'i' })
        }
        const totalRes = await db.collection('customers').where(query).count()
        const res = await db.collection('customers')
          .where(query)
          .orderBy('added_at', 'desc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get()
        return {
          code: 0,
          data: {
            list: res.data,
            total: totalRes.total,
            page,
            pageSize
          }
        }
      }

      case 'detail': {
        const res = await db.collection('customers').doc(id).get()
        if (!res.data || res.data._openid !== OPENID) {
          return { code: -1, msg: '客户不存在' }
        }
        return { code: 0, data: res.data }
      }

      case 'updateTags': {
        await db.collection('customers').doc(id).update({
          data: { tags, updated_at: db.serverDate() }
        })
        return { code: 0 }
      }

      case 'updatePhone': {
        await db.collection('customers').doc(id).update({
          data: { phone, updated_at: db.serverDate() }
        })
        return { code: 0 }
      }

      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (e) {
    return { code: -1, msg: e.message }
  }
}