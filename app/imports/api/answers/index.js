import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Answers = new Mongo.Collection('answers')

const AnswersSchema = new SimpleSchema({
  questionId: {
    label: '问题 ID',
    type: String,
    optional: false
  },
  content: {
    label: '回答内容',
    type: String,
    optional: false
  },
  userId: {
    label: '作者 Id',
    type: String,
    optional: false
  },
  author: {
    label: '作者',
    type: String,
    optional: false
  },
  likedUsers: {
    label: '点赞的用户列表',
    type: Array,
    defaultValue: [],
    optional: true
  },
  'likedUsers.$': {
    type: String
  },
  avatar: {
    label: '作者头像',
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

Answers.attachSchema(AnswersSchema)

Answers.deny({
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

export default Answers
