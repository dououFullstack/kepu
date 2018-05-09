import { JsonRoutes as Routes } from 'meteor/simple:json-routes'

export default ({ Meteor, moment, wxpay, Collections }) => {
  const { Users, Transactions } = Collections
  Routes.setResponseHeaders({
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  })

  // 微信支付回调地址处理
  Routes.Middleware.use(wxpay.useWXCallback(Meteor.bindEnvironment((msg, req, res, next) => {
    if (req.originalUrl === '/pay-cb') {
      if (!msg) {
        return next()
      }

      // 根据返回的 nonce_str 查询订单
      const trans = Transactions.findOne({ nonce_str: msg.nonce_str })
      if (trans) {
        // 如果订单已经是成功状态就不再处理
        if (trans.status === 'success') {
          res.success()
        // 如果订单依然处于 pending 状态，证明是没处理过的订单
        } else if (trans.status === 'pending') {
          // 找到用户信息
          const user = Users.findOne({ 'services.wechat-mp.openId': msg.openid })
          if (!user) {
            return res.fail()
          }
          // 更新订单状态
          Transactions.update({ nonce_str: msg.nonce_str }, {
            $set: {
              ...msg,
              status: 'success'
            }
          })

          // 更新活动的报名状态
          if (trans.type === 'activity') {
            Users.update({ 'services.wechat-mp.openId': msg.openid }, {
              $push: { boughtActivities: trans.productId }
            })
          } else if (trans.type === 'video') {
            Users.update({ 'services.wechat-mp.openId': msg.openid }, {
              $push: { boughtVideos: trans.productId }
            })
          }

          res.success()
        }
      } else {
        // nonce_str不匹配
        return next()
      }
    } else {
      return next()
    }
  })))
}
