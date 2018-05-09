import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import Collections from '../../api/collections'
import * as UserRoles from '/imports/lib/roles'
import moment from 'moment'
import Global from './global'
import WXPay from '/imports/api/lib/weixin-pay/wxpay'
import fs from 'fs'

const { appId, mchId, partnerKey } = Global.wechat

const wxpay = WXPay({
  appid: appId,
  mch_id: mchId,
  partner_key: partnerKey, // 微信商户平台API密钥
  pfx: fs.readFileSync(Assets.absoluteFilePath('apiclient_cert.p12')) // 微信商户平台证书
})

export default {
  Meteor,
  Accounts,
  Random,
  check,
  Match,
  Roles,
  Collections,
  UserRoles,
  Global,
  wxpay,
  moment
}
