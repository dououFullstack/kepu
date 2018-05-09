import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const GlobalSettings = new Mongo.Collection('globalSettings')

const GlobalSettingsSchema = new SimpleSchema({
  key: {
    label: '设置关键字',
    type: String
  },
  value: {
    label: '设置的值',
    type: String
  }
})

GlobalSettings.attachSchema(GlobalSettingsSchema)

export default GlobalSettings
