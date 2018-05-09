import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Session } from 'meteor/session'
import { Roles } from 'meteor/alanning:roles'
import moment from 'moment'
import Collections from '/imports/api/collections'
import '/imports/api/lib/wx-js-sdk.min'
import * as UserRoles from '/imports/lib/roles'
import Global from './global'

import 'moment/locale/zh-cn'

moment.locale('zh-cn')

const wx = this.wx

const LocalState = new ReactiveDict()

export default {
  Meteor,
  Accounts,
  Random,
  Roles,
  Collections,
  UserRoles,
  Global,
  LocalState,
  Session,
  moment,
  wx
}
