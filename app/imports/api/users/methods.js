export default ({ Meteor, Collections, Random, Roles, UserRoles, Accounts, check, Match }) => {
  const { Users, InviteCodes, Enrollments } = Collections

  Meteor.methods({
    'users.create' (userId, username, password, isExpert = false, inviteCode = '') {
      check(userId, String)
      check(username, String)
      check(password, String)
      check(isExpert, Boolean)
      check(inviteCode, String)

      let setExpert = false
      const user = Users.findOne(userId)
      if (!user) {
        throw new Meteor.Error(400, '没有找到要绑定的微信用户！')
      }

      if (isExpert && inviteCode !== '') {
        // 如果注册的是专家账号，那么校验专家号邀请码是否正确
        const code = InviteCodes.findOne({
          code: inviteCode
        })
        if (code.status) {
          throw new Meteor.Error(401, '邀请码已经被使用！')
        }
        setExpert = true
      }

      if (setExpert) {
        Roles.addUsersToRoles(user._id, UserRoles.EXPERT)
        InviteCodes.update({ code: inviteCode }, {
          $set: { status: true, usedUserName: username }
        })
      }

      Users.update({ _id: user._id }, {
        $set: { username: username }
      })

      Accounts.setPassword(user._id, password)

      return user._id
    },
    'users.changePassword' (telephone, code, password) {
      const user = Users.findOne({ username: telephone })
      if (!user) {
        throw new Meteor.Error(400, '没有找到该用户')
      }
      // 验证短信验证码是否正确
      if (Meteor.call('messages.check', telephone, code) === telephone) {
        Accounts.setPassword(user._id, password)
      } else {
        throw new Meteor.Error(401, '修改密码失败，错误的验证码')
      }
    },
    'users.updateProfile' (userId, profileObj) {
      check(userId, String)
      check(profileObj, Object)

      const user = Users.findOne(userId)
      if (!user) {
        throw new Meteor.Error(400, '没有找到该用户')
      }

      const profile = {
        headimgurl: profileObj.headimgurl,
        nickname: profileObj.nickname,
        wechat: profileObj.wechat,
        address: profileObj.address
      }

      return Users.update(userId, {
        $set: {
          profile: profile,
          'emails.0.address': profileObj.email
        }
      })
    },
    'users.setRoles' (userId, isExpert, userRole) {
      check(userId, String)
      check(isExpert, Boolean)
      check(userRole, Array)

      if (isExpert) {
        Roles.removeUsersFromRoles(userId, userRole)
      } else {
        Roles.addUsersToRoles(userId, userRole)
      }
    },
    'users.setExpertState' (userId, state) {
      check(userId, String)
      check(state, Boolean)

      if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        Users.update(userId, {
          $set: { isWorking: state }
        })
      } else {
        throw new Meteor.Error(400, '无权设置专家状态')
      }
    },
    'users.ban' (userId, isBan) {
      check(userId, String)
      check(isBan, Boolean)

      if (this.userId === userId) {
        throw new Meteor.Error(401, '不能设置自己的属性')
      }

      if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        Users.update(userId, {
          $set: { isBan: isBan }
        })
      } else {
        throw new Meteor.Error(400, '无权设置用户属性')
      }
    },
    'users.count' (searchTerm) {
      check(searchTerm, Match.OneOf(String, null, undefined))

      if (!Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '无权获取用户数量')
      }

      let query = {}

      if (searchTerm) {
        const regex = new RegExp(searchTerm, 'i')
        Object.assign(query, {
          username: regex
        })
      }

      return Users.find(query).count()
    },
    'user.boughtActivityCount' (userId) {
      check(userId, String)
      return Enrollments.find({ userId: userId }).count()
    },
    'user.boughtVideoCount' (userId) {
      check(userId, String)
      const user = Users.findOne(userId)
      let boughtVideos = 0

      if (user && Array.isArray(user.boughtVideos)) {
        boughtVideos = user.boughtVideos.length
      }

      return boughtVideos
    }
  })
}
