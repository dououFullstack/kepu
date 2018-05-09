export default ({ Meteor, Collections, check }) => {
  const { Enrollments } = Collections

  Meteor.publish('enrollments.activity', function (activityId) {
    check(activityId, String)
    return Enrollments.find({activityId: activityId})
  })

  Meteor.publish('enrollments.byUserId', function (userId) {
    check(userId, String)
    return Enrollments.find({userId: userId})
  })
}
