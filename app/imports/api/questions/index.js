import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Questions = new Mongo.Collection('questions')

const QuestionsSchema = new SimpleSchema({
  title: {
    label: '问题标题',
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
    label: '问题内容',
    type: String,
    optional: true
  },
  userId: {
    label: '创建者ID',
    type: String,
    optional: false
  },
  author: {
    label: '作者',
    type: String,
    optional: false
  },
  avatar: {
    label: '作者头像',
    type: String,
    optional: true
  },
  invitationIds: {
    label: '邀请回答',
    type: Array,
    optional: true
  },
  'invitationIds.$': {
    type: String
  },
  answerTotal: {
    label: '回答总数',
    type: Number,
    defaultValue: 0,
    optional: true
  },
  attachments: {
    label: '图片列表',
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

  // 不要配置默认值，发布数据时，如果该字段为被设置，会根据时间判断是否超过1天自动显示
  // 如果该字段被设置了值，证明管理员人工干预过，所以会根据管理员的设置属性来决定是否可见
  isVisible: {
    label: '是否可见',
    type: Boolean,
    optional: true
  },
  showTime: {
    label: '视频未审核自动发布时间',
    type: Date,
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

Questions.attachSchema(QuestionsSchema)

Questions.deny({
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

export default Questions
