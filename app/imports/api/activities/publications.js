export default ({ Meteor, Collections, check, Match }) => {
  const { Activities } = Collections
  const DEVELOPMENT = Meteor.isDevelopment

  Meteor.publish('activities.pagination', function (currentPage, searchTerm, pageSize = 10) {
    check(currentPage, Number)
    check(searchTerm, Match.OneOf(String, null, undefined))
    if (DEVELOPMENT) Meteor._sleepForMs(500)

    let query = {}
    const projection = { sort: { createdAt: -1, updatedAt: -1 } }

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')
      query = {
        $or: [
          { title: regex },
          { telephone: regex }
        ]
      }
    }

    Object.assign(projection, {
      limit: pageSize * currentPage
    })
    return Activities.find(query, projection)
  })

  Meteor.publish('activities.activity', function (activityId) {
    check(activityId, String)
    return Activities.find(activityId)
  })

  Meteor.publish('activities.activityIds', function (activityIds) {
    check(activityIds, Array)
    return Activities.find({ _id: { $in: activityIds } })
  })
}
