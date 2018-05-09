import { Mongo } from 'meteor/mongo'
// import { Random } from 'meteor/random'
import SimpleSchema from 'simpl-schema'

const Enrollments = new Mongo.Collection('enrollments')

const EnrollmentsSchema = new SimpleSchema({
  activityId: {
    label: '活动 ID',
    type: String,
    optional: false
  },
  userId: {
    label: '报名人的用户 Id',
    type: String,
    optional: false
  },
  status: {
    label: '报名的状态',  // 1 合法，2 申请退款，3 关闭
    type: Number,
    optional: false
  },
  username: {
    label: '报名人姓名',
    type: String,
    optional: false
  },
  gender: {
    label: '报名人性别',
    type: String,
    optional: false
  },
  IDCardType: {
    label: '报名人证件类型',
    type: String,
    optional: false
  },
  IDCardNumber: {
    label: '报名人证件号',
    type: String,
    optional: false
  },
  telephone: {
    label: '报名人手机号',
    type: String,
    optional: false
  },
  email: {
    label: '报名人邮箱',
    type: String,
    optional: true
  },
  attachments: {
    label: '附件',
    type: Array,
    optional: true,
    blackbox: true
  },
  'attachments.$': {
    type: Object
  },
  'attachments.$.key': {
    type: String
  },
  'attachments.$.uid': {
    type: String
  },
  'attachments.$.name': {
    type: String
  },
  'attachments.$.status': {
    type: String
  },
  'attachments.$.url': {
    type: String
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

Enrollments.attachSchema(EnrollmentsSchema)

Enrollments.deny({
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

export default Enrollments
