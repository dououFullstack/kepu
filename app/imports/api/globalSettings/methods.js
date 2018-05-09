import _ from 'underscore'

export default ({ Meteor, Collections, check, UserRoles, Roles }) => {
  const { GlobalSettings } = Collections

  Meteor.methods({
    'globalSettings.set' (globalSettings) {
      check(globalSettings, Object)

      _.keys(globalSettings).map((key, i) => {
        GlobalSettings.upsert({ key: key }, {
          $set: {
            key: key,
            value: globalSettings[key]
          }
        })
      })
    }
  })
}
