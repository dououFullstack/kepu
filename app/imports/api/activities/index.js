import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Activities = new Mongo.Collection('activities')

const ActivitiesSchema = new SimpleSchema({
  title: {
    label: '活动标题',
    type: String,
    optional: false
  },
  viewCount: {
    label: '浏览量',
    type: Number,
    optional: false,
    defaultValue: 0
  },
  content: {
    label: '活动内容',
    type: String,
    optional: false
  },
  defaultImage: {
    label: '活动首页默认图片',
    type: Object,
    optional: false,
    blackbox: true
  },
  address: {
    label: '活动地址',
    type: String,
    optional: false
  },
  beginTime: {
    label: '活动开始时间',
    type: Date,
    optional: false
  },
  endTime: {
    label: '活动结束时间',
    type: Date,
    optional: false
  },
  charge: {
    label: '费用',
    type: Number,
    optional: true
  },
  refund: {
    label: '是否退款',
    type: Boolean,
    optional: true
  },
  notice: {
    label: '活动注意事项',
    type: String,
    optional: true
  },
  telephone: {
    label: '活动主办方电话',
    type: String,
    optional: false
  },
  attachments: {
    label: '附件',
    type: Array,
    optional: true
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

Activities.attachSchema(ActivitiesSchema)

Activities.deny({
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

export default Activities
