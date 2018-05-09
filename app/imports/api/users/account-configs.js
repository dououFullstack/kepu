import { ServiceConfiguration } from 'meteor/service-configuration'
import { WeChatMP } from 'meteor/zhaoyao91:accounts-wechat-mp'

export default (context) => {
  const { Global, Accounts, Meteor } = context
  const { wechat, wechatDev } = Global
  const { appId, appSecret } = Meteor.isDevelopment ? wechatDev : wechat

  // zhaoyao91:accounts-wechat-mp 包初始化函数，参考 zhaoyao91:accounts-wechat-mp 包
  ServiceConfiguration.configurations.upsert({
    service: WeChatMP.serviceName
  }, {
    $set: {
      appId: appId,
      secret: appSecret,
      scope: 'base_userinfo',
      loginStyle: 'redirect',
      mainId: 'openId'
    }
  })

  // 创建用户时自动添加 roles 字段和 profile 字段
  // profile 部分内容来自微信登录同步的数据，如性别
  Accounts.onCreateUser((options, user) => {
    user.roles = ['user']
    user.profile = options.profile
    return user
  })
}
