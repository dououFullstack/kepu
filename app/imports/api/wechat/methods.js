import CryptoJS from 'crypto-js'
import { HTTP } from 'meteor/http'

export default ({ Meteor, Collections, Global, wxpay, check, Random, Roles, UserRoles }) => {
  const { endpoint, appId, appSecret } = Meteor.isDevelopment ? Global.wechatDev : Global.wechat
  const { Transactions, Users, Enrollments } = Collections

  Meteor.methods({
    'wechat.signature' (url) {
      check(url, String)

      // get access token
      const getAccessTokenResult = HTTP.get(`${endpoint}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
      const accessToken = getAccessTokenResult.data.access_token

      // get ticket
      const nowtime = parseInt(new Date().getTime() / 1000)
      if (Global.wechat.sign_expires_in === 0 || (nowtime - Global.wechat.sign_timestamp) > Global.wechat.sign_expires_in - 300) {
        const result = HTTP.get(`${endpoint}/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`)
        const jsonContent = result.data
        Global.wechat.sign_expires_in = jsonContent.expires_in
        Global.wechat.ticket = jsonContent.ticket
        Global.wechat.sign_timestamp = nowtime
      }

      // get sign
      const output = {
        jsapi_ticket: Global.wechat.ticket,
        nonceStr: Math.random().toString(36).substr(2, 15),
        timestamp: parseInt(new Date().getTime() / 1000) + '',
        url
      }

      let keys = Object.keys(output)
      let newArgs = {}
      let string = ''

      keys = keys.sort()
      keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = output[key]
      })

      for (const k in newArgs) {
        string += `&${k}=${newArgs[k]}`
      }

      string = string.substr(1)
      output.signature = CryptoJS.SHA1(string).toString()
      output.appId = appId
      return output
    },
    'wechat.getPayRequestParams' (data) {
      check(data, Object)

      // 生成订单所需的数据，参考微信文档 https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
      let params
      let type
      let productId
      const body = '互动科普-活动报名费用'
      const nonceStr = Random.id(32)
      const openId = Meteor.user().services['wechat-mp'].openId
      const outTradeNo = new Date().getTime() + Math.random().toString().substr(2, 10)
      const totalFee = data.charge * 100

      // 区分是视频还是活动
      if (data.activityId) {
        type = 'activity'
        productId = data.activityId
      } else if (data.videoId) {
        type = 'video'
        productId = data.videoId
      } else {
        throw new Meteor.Error(500, '错误的商品类型')
      }

      // 发起求情
      const getParamsSync = Meteor.wrapAsync(wxpay.getBrandWCPayRequestParams, wxpay)
      try {
        params = getParamsSync({
          openid: openId,
          body: body,
          out_trade_no: outTradeNo,
          total_fee: totalFee,
          nonce_str: nonceStr,
          spbill_create_ip: this.connection.clientAddress,
          notify_url: `${Meteor.absoluteUrl()}pay-cb`
          // detail: '公众号支付测试',
        })
      } catch (e) {
        throw new Meteor.Error(501, e.reason || e.message)
      }

      // 将生成的订单信息写入订单列表，并设置状态为 pending
      // 当微信调用我们指定的回调地址时，确认支付状态后再更新订单状态
      const user = Meteor.user()
      Transactions.insert({
        userId: user._id,
        username: user.username,
        refund: data.activityId ? data.refund : false,
        productId: productId,
        type: type,
        nonce_str: nonceStr,
        out_trade_no: outTradeNo,
        total_fee: totalFee,
        status: 'pending',
        createdAt: new Date()
      })

      return params
    },
    'wechat.refund' (data, refund) {
      check(data, Object)
      check(refund, Boolean)

      if (!Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '你无权发起退款请求')
      }

      const transaction = Transactions.findOne(data.id)
      if (!transaction) {
        throw new Meteor.Error(401, '未找到该订单')
      }

      if (!refund) {
        return Transactions.update(transaction._id, {
          $set: { status: 'success' }
        })
      }

      if (transaction.status === 'closed') {
        throw new Meteor.Error(401, '该订单已关闭')
      }

      let params
      const mchId = Global.wechat.mchId
      const nonceStr = Random.id(32)
      const transactionId = data.transaction_id
      const totalFee = data.total_fee
      const outRefundNo = new Date().getTime() + Math.random().toString().substr(2, 10)

      // 发起求情
      const getParamsSync = Meteor.wrapAsync(wxpay.refund, wxpay)
      try {
        params = getParamsSync({
          mch_id: mchId,
          nonce_str: nonceStr,
          transaction_id: transactionId,
          out_refund_no: outRefundNo,
          total_fee: totalFee,
          refund_fee: totalFee
        })
      } catch (e) {
        throw new Meteor.Error(501, e.reason || e.message)
      }

      if (params.return_code === 'SUCCESS') {
        // 关闭订单
        Transactions.update(transaction._id, {
          $set: {
            out_refund_no: outRefundNo,
            refund_fee: totalFee,
            status: 'closed'
          }
        })

        // 从用户属性中移除相应活动或视频
        if (transaction.type === 'activity') {
          Users.update(transaction.userId, {
            $pull: { boughtActivities: transaction.productId }
          })
          // 从报名列表中删除该用户报名的信息
          Enrollments.remove({
            userId: transaction.userId,
            activityId: transaction.productId
          })
        } else {
          Users.update(transaction.userId, {
            $pull: { boughtVideos: transaction.productId }
          })
        }
      }

      return params
    }
  })
}
