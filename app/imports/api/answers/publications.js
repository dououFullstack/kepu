export default ({ Meteor, Collections, check }) => {
  const { Answers } = Collections

  Meteor.publish('answers.question', function (questionId) {
    check(questionId, String)
    return Answers.find({questionId})
  })

  Meteor.publish('answers.byUserId', function (userId) {
    check(userId, String)
    return Answers.find({ userId: userId })
  })
}
