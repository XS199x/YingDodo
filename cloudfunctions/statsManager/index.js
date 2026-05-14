const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, activityId } = event

  try {
    switch (action) {
      case 'activityStats': {
        const scanRes = await db.collection('activity_records')
          .where({ activity_id: activityId, action_type: 'scan' })
          .count()

        const claimRes = await db.collection('activity_records')
          .where({ activity_id: activityId, action_type: 'claim' })
          .count()

        const shareRes = await db.collection('activity_records')
          .where({ activity_id: activityId, action_type: 'share' })
          .count()

        const newCustomerRes = await db.collection('customers')
          .where({ source_activity_id: activityId })
          .count()

        const scanCount = scanRes.total
        const claimCount = claimRes.total
        const shareCount = shareRes.total
        const newCustomerCount = newCustomerRes.total

        let summary = ''
        if (newCustomerCount > 0) {
          summary = `这次活动帮你带来${newCustomerCount}个新客`
          if (claimCount > 0) {
            summary += `，其中${claimCount}人已领券`
          }
        } else if (scanCount > 0) {
          summary = `已有${scanCount}人查看了你的活动`
        } else {
          summary = '活动还没有人参与，快去分享吧'
        }

        return {
          code: 0,
          data: {
            scanCount,
            claimCount,
            shareCount,
            newCustomerCount,
            summary
          }
        }
      }

      case 'overview': {
        const activityRes = await db.collection('activities')
          .where({ _openid: OPENID, status: 'active' })
          .count()

        const customerRes = await db.collection('customers')
          .where({ _openid: OPENID })
          .count()

        const totalScanRes = await db.collection('activity_records')
          .where({ action_type: 'scan' })
          .count()

        return {
          code: 0,
          data: {
            activeActivityCount: activityRes.total,
            totalCustomerCount: customerRes.total,
            totalScanCount: totalScanRes.total
          }
        }
      }

      case 'record': {
        const { OPENID: customerOpenid } = cloud.getWXContext()
        const { actionType } = event

        await db.collection('activity_records').add({
          data: {
            activity_id: activityId,
            customer_openid: customerOpenid,
            action_type: actionType,
            created_at: db.serverDate()
          }
        })

        if (actionType === 'claim') {
          const exist = await db.collection('customers')
            .where({ _openid: OPENID, customer_openid: customerOpenid })
            .get()

          if (exist.data.length === 0) {
            await db.collection('customers').add({
              data: {
                _openid: OPENID,
                customer_openid: customerOpenid,
                nickname: '微信用户',
                avatar: '',
                phone: '',
                tags: [],
                source_activity_id: activityId,
                added_at: db.serverDate(),
                updated_at: db.serverDate()
              }
            })
          }
        }

        return { code: 0 }
      }

      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (e) {
    return { code: -1, msg: e.message }
  }
}