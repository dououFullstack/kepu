export default ({ Meteor, Collections, check, UserRoles, Roles }) => {
  const { InviteCodes } = Collections

  Meteor.publish('inviteCodes.all', function () {
    if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
      return InviteCodes.find({}, {
        sort: { createdAt: -1 }
      })
    } else {
      throw new Meteor.Error(400, '你无权获取用户邀请码')
    }
  })

  Meteor.publish('inviteCodes.byFrontAdmin', function () {
    if (Roles.userIsInRole(this.userId, UserRoles.FRONTADMIN)) {
      return InviteCodes.find({
        status: false
      }, {
        sort: { createdAt: -1 }
      })
    } else {
      throw new Meteor.Error(400, '你无权获取用户邀请码')
    }
  })
}
