const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, id, data, status } = event

  try {
    switch (action) {
      case 'list': {
        const query = { _openid: OPENID }
        if (status) query.status = status
        const res = await db.collection('activities')
          .where(query)
          .orderBy('created_at', 'desc')
          .limit(50)
          .get()
        return { code: 0, data: res.data }
      }

      case 'detail': {
        const res = await db.collection('activities').doc(id).get()
        if (!res.data || res.data._openid !== OPENID) {
          return { code: -1, msg: '活动不存在' }
        }
        return { code: 0, data: res.data }
      }

      case 'create': {
        const res = await db.collection('activities').add({
          data: {
            _openid: OPENID,
            ...data,
            status: 'active',
            created_at: db.serverDate(),
            updated_at: db.serverDate()
          }
        })
        return { code: 0, data: { _id: res._id } }
      }

      case 'update': {
        await db.collection('activities').doc(id).update({
          data: { ...data, updated_at: db.serverDate() }
        })
        return { code: 0 }
      }

      case 'delete': {
        await db.collection('activities').doc(id).remove()
        await db.collection('activity_records').where({ activity_id: id }).remove()
        return { code: 0 }
      }

      case 'end': {
        await db.collection('activities').doc(id).update({
          data: { status: 'ended', end_time: db.serverDate(), updated_at: db.serverDate() }
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