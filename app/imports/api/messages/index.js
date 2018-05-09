import { Mongo } from 'meteor/mongo'
// import { Random } from 'meteor/random'
import SimpleSchema from 'simpl-schema'

const Messages = new Mongo.Collection('messages')

const MessagesSchema = new SimpleSchema({
  phoneNumber: {
    label: '电话号码',
    type: String,
    optional: false
  },
  status: {
    label: '是否被使用',
    type: Boolean,
    defaultValue: false,
    optional: false
  },
  messageCode: {
    label: '后台生成的短信验证码',
    type: String,
    optional: false
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

Messages.attachSchema(MessagesSchema)

Messages.deny({
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

export default Messages
