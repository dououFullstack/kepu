import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const InviteCodes = new Mongo.Collection('inviteCodes')

const InviteCodesSchema = new SimpleSchema({
  code: {
    label: '电话号码',
    type: String,
    optional: false
  },
  status: {
    label: '使用状态', // 0 used 1 unused
    type: Boolean,
    defaultValue: false,
    optional: false
  },
  usedUserName: {
    label: '使用用户的手机号码',
    type: String,
    optional: true
  },
  createdAt: {
    label: '创建时间',
    type: Date,
    autoValue () {
      if (this.isInsert) {
        return new Date()
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        }
      }
    }
  },
  updatedAt: {
    label: '更新时间',
    type: Date,
    autoValue () {
      if (this.isUpdate) {
        return {
          $set: new Date()
        }
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        }
      }
    },
    optional: true
  }
})

InviteCodes.attachSchema(InviteCodesSchema)

InviteCodes.deny({
  insert () {
    return true
  },
  update () {
    return true
  },
  remove () {
    return true
  }
})

export default InviteCodes
