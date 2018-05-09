export default ({ Meteor, Collections, check, Match, Roles, UserRoles }) => {
  const { Videos, Users } = Collections

  Meteor.methods({
    'videos.create' (videoObj) {
      check(videoObj, Object)

      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '只有管理员才能创建视频！')
      }

      const video = Videos.insert(videoObj)

      return video._id
    },
    'videos.update' (videoObj, videoId) {
      check(videoObj, Object)
      check(videoId, String)

      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '只有管理员才能编辑视频！')
      }

      const video = Videos.update(videoId, {
        $set: videoObj
      })

      return video._id
    },
    'videos.delete' (videoId) {
      check(videoId, String)

      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '只有管理员才能删除视频！')
      } else {
        // 从用户购买列表中删除这个视频的信息
        Users.update({
          boughtVideos: { $elemMatch: { $in: [videoId] } }
        }, {
          $pull: { boughtVideos: videoId }
        })
      }

      return Videos.remove(videoId)
    },
    'videos.setVisible' (videoId, isVisible) {
      check(videoId, String)
      check(isVisible, Boolean)

      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '只有管理员才能设置视频属性！')
      }

      return Videos.update(videoId, {
        $set: { isVisible: isVisible }
      })
    },
    'videos.count' (searchTerm) {
      check(searchTerm, Match.OneOf(String, null, undefined))

      if (!Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '你没有权限获取视频总数！')
      }

      let query = {}

      if (searchTerm) {
        const regex = new RegExp(searchTerm, 'i')
        Object.assign(query, {
          title: regex
        })
      }

      return Videos.find(query).count()
    },
    'videos.countByUser' (searchTerm) {
      check(searchTerm, Match.OneOf(String, null, undefined))

      let query = {
        isVisible: true
      }
      if (searchTerm) {
        const regex = new RegExp(searchTerm, 'i')
        query = {
          $or: [
            { title: regex }
          ]
        }
      }
      return Videos.find(query).count()
    },
    'videos.viewCount' (videoId) {
      check(videoId, String)

      const video = Videos.findOne(videoId)
      if (video && !video.viewCount) {
        Videos.update(videoId, {
          $set: { viewCount: 0 }
        })
      }

      return Videos.update(videoId, {
        $inc: { viewCount: 1 }
      })
    }
  })
}
