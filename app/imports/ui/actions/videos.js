import { browserHistory } from 'react-router'
import Toast from 'antd-mobile/lib/toast'

export default {
  boughtVideo ({ Meteor, Global, wx, Session }, video) {
    const user = Meteor.user()
    if (!user) {
      Toast.fail('尚未登录，请登录后重试', 3)
      Session.set('redirectUrl', `/videos/${video._id}`)
      browserHistory.replace(`/videos/${video._id}`)
      browserHistory.push('/mine/login')
    } else {
      if (video.charge) {
        Meteor.call('wechat.getPayRequestParams', { videoId: video._id, charge: video.charge }, (err, res) => {
          if (err) {
            throw new Meteor.Error(err)
          }
          // 生成支付订单
          wx.chooseWXPay({
            appId: Global.wechat.appId,
            timestamp: res.timeStamp,
            nonceStr: res.nonceStr,
            package: res.package,
            signType: res.signType,
            paySign: res.paySign,
            success (res) {
              if (res.errMsg === 'chooseWXPay:ok') {
                Toast.success('购买成功', 3)
                browserHistory.push(`/videos/${video._id}`)
              } else {
                Toast.fail(`购买失败，${res.errMsg}`, 3)
              }
            },
            fail (res) {
              Toast.fail(`支付失败，${res.errMsg}`, 3)
            },
            cancel (res) {
              // Toast.fail(`取消支付，${res.errMsg}`, 3)
            }
          })
        })
      }
    }
  },
  loadMoreVideos ({ Meteor, LocalState }) {
    const currentPath = browserHistory.getCurrentLocation().pathname
    if (currentPath === '/videos') {
      const currentVideoPage = LocalState.get('currentVideoPage') || 1
      LocalState.set('currentVideoPage', currentVideoPage + 1)
    }
  }
}
