import _ from 'underscore'

export default ({ Meteor, Collections, check, Match, Roles, UserRoles }) => {
  const { Videos, Users } = Collections
  const DEVELOPMENT = Meteor.isDevelopment

  Meteor.publish('videos.pagination', function (currentPage, searchTerm, pageSize = 10) {
    check(currentPage, Number)
    check(searchTerm, Match.OneOf(String, null, undefined))
    if (DEVELOPMENT) Meteor._sleepForMs(500)

    let query = {}
    const projection = {
      sort: { createdAt: -1 },
      limit: pageSize * currentPage
    }

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')
      query = {
        $or: [
          { title: regex }
        ]
      }
    }

    if (!Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
      Object.assign(query, {
        isVisible: true
      })
    }

    return Videos.find(query, projection)
  })

  Meteor.publish('videos.video', function (videoId) {
    check(videoId, String)

    let fields = {
      _id: 1,
      title: 1,
      content: 1,
      defaultImage: 1,
      charge: 1,
      isVisible: 1,
      createdAt: 1,
      updatedAt: 1
    }
    const video = Videos.findOne(videoId)
    const user = Users.findOne(this.userId)

    // 如果视频不需要支付或者用户已经购买过，就发布 video 字段
    if (video.charge) {
      if (user && _.indexOf(user.boughtVideos, videoId) !== -1) {
        Object.assign(fields, {
          defaultVideo: 1
        })
      }
    } else {
      Object.assign(fields, {
        defaultVideo: 1
      })
    }

    return Videos.find(videoId)
  })

  Meteor.publish('videos.videoIds', function (videoIds) {
    check(videoIds, Array)
    return Videos.find({ _id: { $in: videoIds } })
  })
}
