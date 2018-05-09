export default ({ Meteor, Collections, check, UserRoles, Roles }) => {
  const { GlobalSettings } = Collections

  Meteor.publish('globalSettings.all', function () {
    if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
      return GlobalSettings.find()
    } else {
      throw new Meteor.Error(400, '你无权获取用户邀请码')
    }
  })
}
