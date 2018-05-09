export default ({ Meteor, Collections, Match, Roles, UserRoles, check }) => {
  const { Activities, Enrollments, Users } = Collections

  Meteor.methods({
    'activities.create' (activityObj) {
      check(activityObj, Object)

      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '只有管理员才能创建活动！')
      }

      const activity = Activities.insert(activityObj)

      return activity._id
    },
    'activities.update' (activityObj, activityId) {
      check(activityObj, Object)
      check(activityId, String)

      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '只有管理员才能编辑活动！')
      }

      const activity = Activities.update(activityId, {
        $set: activityObj
      })

      return activity._id
    },
    'activities.delete' (activityId) {
      check(activityId, String)

      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '只有管理员才能删除活动！')
      }

      // 从已经购买的用户列表中删除购买记录
      Users.update({
        boughtActivities: { $elemMatch: { $in: [activityId] } }
      }, {
        $pull: { boughtActivities: activityId }
      })

      Activities.remove(activityId)
      return Enrollments.remove({ activityId: activityId })
    },
    'activities.count' () {
      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '你无权获取活动总数')
      }

      return Activities.find().count()
    },
    'activities.countByUser' (searchTerm) {
      check(searchTerm, Match.OneOf(String, null, undefined))

      let query = {}
      if (searchTerm) {
        const regex = new RegExp(searchTerm, 'i')
        query = {
          $or: [
            { title: regex },
            { telephone: regex }
          ]
        }
      }

      return Activities.find(query).count()
    },
    'activities.viewCount' (activityId) {
      check(activityId, String)

      const activity = Activities.findOne(activityId)
      if (activity && !activity.viewCount) {
        Activities.update(activityId, {
          $set: { viewCount: 0 }
        })
      }

      return Activities.update(activityId, {
        $inc: { viewCount: 1 }
      })
    }
  })
}
