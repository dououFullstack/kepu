import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Videos = new Mongo.Collection('videos')

const VideosSchema = new SimpleSchema({
  title: {
    label: '视频标题',
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
    label: '视频内容',
    type: String,
    optional: false
  },
  isVisible: {
    label: '是否可见',
    type: Boolean,
    defaultValue: false,
    optional: false
  },
  defaultImage: {
    label: '默认图片',
    type: Object,
    defaultValue: {},
    optional: false,
    blackbox: true
  },
  defaultVideo: {
    label: '视频信息',
    type: Object,
    defaultValue: {},
    optional: false,
    blackbox: true
  },
  charge: {
    label: '费用',
    type: Number,
    optional: true
  },
  freeTime: {
    label: '免费观看时长（秒）',
    type: Number,
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

Videos.attachSchema(VideosSchema)

Videos.deny({
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

export default Videos
