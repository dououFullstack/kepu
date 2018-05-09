export default ({ Meteor, Collections, check, UserRoles, Roles }) => {
  const { InviteCodes } = Collections

  Meteor.methods({
    'inviteCodes.create' (count) {
      check(count, Number)

      if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        for (let i = 0; i < count; i++) {
          const code = Math.random().toString(36).substr(2, 7).toUpperCase()
          InviteCodes.insert({
            code: code
          })
        }
      } else {
        throw new Meteor.Error(400, '你没有权限管理邀请码')
      }
    }
  })
}
