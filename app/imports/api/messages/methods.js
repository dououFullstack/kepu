import { HTTP } from 'meteor/http'

export default ({ Meteor, Collections, check, Global }) => {
  const { Messages } = Collections
  const { yunpian } = Global
  const { APPKEY, URL } = yunpian
  const DEVELOPMENT = Meteor.isDevelopment

  Meteor.methods({
    'messages.send' (phoneNumber) {
      check(phoneNumber, String)

      // 控制1分钟只允许发送一次
      const nowTime = new Date()
      const beforeTime = nowTime.setMinutes(nowTime.getMinutes() - 1, nowTime.getSeconds(), 0)
      const message = Messages.findOne({
        phoneNumber: phoneNumber
      }, {
        sort: { createdAt: -1 }
      })

      // 校验发送时间
      if (message && message.createdAt.getTime() > beforeTime) {
        throw new Meteor.Error(400, '一分钟仅允许发送一次短信验证码！')
      }

      // 发送短信
      const messageCode = Math.random().toString().substr(2, 6)
      const text = '【互动科普】您的验证码是' + messageCode + '。如非本人操作，请忽略本短信'
      try {
        HTTP.call('POST', URL, { params: {
          apikey: APPKEY,
          mobile: phoneNumber,
          text: text
        }})
        // 将发送记录入库
        const newMessage = Messages.insert({
          phoneNumber,
          messageCode
        })
        return newMessage._id
      } catch (e) {
        const res = e.response
        throw new Meteor.Error(res.statusCode, e.response.data.msg)
      }
    },
    'messages.check' (phoneNumber, messageCode) {
      check(phoneNumber, String)
      check(messageCode, String)

      // 开发模式不校验验证码有效性
      if (DEVELOPMENT) {
        return Messages.findOne({
          phoneNumber: phoneNumber,
          messageCode: messageCode
        }).phoneNumber
      }

      // 查询 30 分钟内有效的最后一条发送记录
      const nowTime = new Date()
      const beforeTime = nowTime.setMinutes(nowTime.getMinutes() - 30, nowTime.getSeconds(), 0)

      // 查询该号码最后一条发送短信的记录
      const message = Messages.findOne({
        phoneNumber: phoneNumber
      }, {
        sort: { createdAt: -1 }
      })

      if (!message) {
        throw new Meteor.Error('401', '没有找到对应记录，错误的验证码或手机号')
      } else if (message.createdAt.getTime() < beforeTime) {
        throw new Meteor.Error('402', '验证码错误或已过期')
      } else if (message.messageCode !== messageCode) {
        throw new Meteor.Error('403', '验证码错误')
      } else if (message.status === true) {
        throw new Meteor.Error('404', '验证码已无效')
      } else {
        Messages.update({ _id: message._id }, {
          $set: { status: true }
        })
        return message.phoneNumber
      }
    }
  })
}
