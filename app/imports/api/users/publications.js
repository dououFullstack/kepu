import { ADMIN } from '/imports/lib/roles'

export default ({Meteor, Collections, check, Match, Roles}) => {
  const { Users } = Collections
  const DEVELOPMENT = Meteor.isDevelopment

  Meteor.publish('users.pagination', function (currentPage, userRole, searchTerm, pageSize = 10) {
    check(currentPage, Number)
    check(userRole, String)
    check(searchTerm, Match.OneOf(String, null, undefined))
    if (DEVELOPMENT) Meteor._sleepForMs(500)

    let query = {}
    const projection = { sort: { createdAt: -1 } }

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')

      query = {
        $or: [
          { username: regex },
          { 'profile.nickname': regex }
        ],
        roles: { $elemMatch: { $in: [userRole] } }
      }
    }

    if (Roles.userIsInRole(this.userId, ADMIN)) {
      Object.assign(projection, {
        // skip: pageSize * (currentPage - 1),
        limit: pageSize * currentPage
      })
      return Users.find(query, projection)
    } else {
      this.stop()
    }
  })

  Meteor.publish('users.current', function () {
    return Meteor.users.find({ _id: this.userId }, {
      fields: {
        profile: 1,
        roles: 1,
        emails: 1,
        isBan: 1,
        boughtActivities: 1,
        boughtVideos: 1
      }
    })
  })

  Meteor.publish('users.experts', function () {
    let query = {
      roles: { $elemMatch: { $in: ['expert'] } }
    }
    let fields = {
      profile: 1,
      roles: 1,
      emails: 1,
      isWorking: 1
    }

    if (!Roles.userIsInRole(this.userId, ADMIN)) {
      // 普通用户仅订阅工作中的专家
      Object.assign(query, {
        isWorking: true
      })
    } else {
      // 管理员拿到用户名用于显示数据（后台显示数据使用）
      Object.assign(fields, {
        username: 1
      })
    }

    return Meteor.users.find(query, { fields: fields })
  })
/*
  Meteor.publish('allUsers', function () {
    if (DEVELOPMENT) Meteor._sleepForMs(500)
    const userId = this.userId
    const hasPermission = Roles.userIsInRole(userId, VIEW_SECTION)
    if (hasPermission) {
      return Meteor.users.find(
        {},
        {
          fields: { services: 0 },
          sort: { createdAt: -1 }
        }
      )
    } else {
      this.stop()
    }
  })

  Meteor.publish('oneUser', function (id) {
    const userId = this.userId
    const hasPermission = Roles.userIsInRole(userId, VIEW_SECTION)
    if (hasPermission) {
      return Meteor.users.find(
        { _id: id },
        {
          fields: { services: 0 },
          sort: { createdAt: -1 }
        }
      )
    } else {
      this.stop()
    }
  })

  Meteor.publish('Users.currentUser', function () {
    const userId = this.userId
    return Meteor.users.find(
      { _id: userId },
      {
        fields: { services: 0 },
        sort: { createdAt: -1 },
        limit: 1
      }
    )
  })

  Meteor.publish('Users.section.name', function () {
    const userId = this.userId
    const CAN_VIEW_ALL_ORDER = Roles.userIsInRole(userId, VIEW_ALL_ORDER)
    const CAN_VIEW_OWNER_ORDER = Roles.userIsInRole(userId, VIEW_OWNER_ORDER)
    if (CAN_VIEW_ALL_ORDER) {
      return Meteor.users.find(
        { role: 'section' },
        {
          fields: { role: 1, title: 1, createdAt: 1 },
          sort: { createdAt: 1 }
        }
      )
    } else if (CAN_VIEW_OWNER_ORDER) {
      return Meteor.users.find(
        {
          role: 'section',
          $or: [{ _id: userId }, { level1Id: userId }, { level2Id: userId }]
        },
        {
          fields: { role: 1, title: 1, createdAt: 1 },
          sort: { createdAt: 1 }
        }
      )
    } else {
      this.stop()
    }
  })
*/
}
