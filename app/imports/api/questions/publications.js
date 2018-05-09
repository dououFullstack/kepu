export default ({ Meteor, Collections, check, Match, Roles, UserRoles }) => {
  const { Questions } = Collections
  const DEVELOPMENT = Meteor.isDevelopment

  Meteor.publish('questions.pagination', function (currentPage, searchTerm, pageSize = 10) {
    check(currentPage, Number)
    check(searchTerm, Match.OneOf(String, null, undefined))
    if (DEVELOPMENT) Meteor._sleepForMs(500)

    let questions
    let query = {}
    let or = []
    const projection = {
      sort: { createdAt: -1 },
      limit: pageSize * currentPage
    }

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')
      Object.assign(query, {
        title: regex
      })
    }

    // 管理员订阅显示所有
    if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
      questions = Questions.find(query, projection)
    } else {
      const nowTime = new Date()
      or.push({
        isVisible: null, showTime: { $lte: nowTime }
      }, {
        isVisible: true
      })
      Object.assign(query, { $or: or })
      questions = Questions.find(query, projection)
    }

    return questions
  })

  Meteor.publish('questions.question', function (questionId) {
    check(questionId, String)
    return Questions.find(questionId)
  })

  Meteor.publish('questions.byUserId', function (userId) {
    check(userId, String)
    return Questions.find({ userId: userId })
  })

  Meteor.publish('questions.questionIds', function (questionIds) {
    check(questionIds, Array)
    return Questions.find({ _id: { $in: questionIds } })
  })

  Meteor.publish('questions.byInvited', function (userId) {
    check(userId, String)

    const nowTime = new Date()

    const questions = Questions.find({
      invitationIds: { $elemMatch: { $in: [userId] } },
      showTime: { $lte: nowTime }
    })
    return questions
  })
}
