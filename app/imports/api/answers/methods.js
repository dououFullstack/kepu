export default ({ Meteor, Collections, check, Roles, UserRoles }) => {
  const { Questions, Answers, Users } = Collections

  Meteor.methods({
    'answers.create' (questionId, content) {
      // 根据问题 Id 向回复的 collection 中插入一条新的回复并更新问题 collection 的回复总数
      check(questionId, String)
      check(content, String)

      let avatar
      let author
      const userId = this.userId

      if (!userId) {
        return Meteor.Error(400, '请登录后重试')
      } else {
        const user = Users.findOne(userId)
        avatar = user.profile.headimgurl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
        author = user.profile.nickname
      }

      Answers.insert({
        questionId,
        content,
        userId,
        avatar,
        author
      }, (err) => {
        // 更新问题的回复总数
        if (!err) {
          Questions.update({ _id: questionId }, {
            $inc: { answerTotal: 1 },
            $pull: { invitationIds: userId }
          })
        }
      })
    },
    'answers.update' () {
      //
    },
    'answers.delete' (answerId, userId) {
      check(answerId, String)
      check(userId, String)

      const answer = Answers.findOne(answerId)
      if (!answer) {
        throw new Meteor.Error(400, '未知的回答编号')
      }

      if (answer.userId === userId || Roles.userIsInRole(userId, UserRoles.ADMIN)) {
        const answer = Answers.findOne(answerId)
        Questions.update({ _id: answer.questionId }, {
          $inc: { answerTotal: -1 }
        })
        Answers.remove(answerId)
      } else {
        throw new Meteor.Error(401, '你无权删除此回答')
      }
    },
    'answers.count' (userId) {
      check(userId, String)
      return Answers.find({ userId: userId }).count()
    },
    'answers.toggleLike' (answerId, liked) {
      check(answerId, String)
      check(liked, Boolean)

      const userId = Meteor.userId()

      if (!userId) {
        throw new Meteor.Error(400, '请登录后重试')
      }

      if (liked) {
        Answers.update(answerId, {
          $pull: { likedUsers: userId }
        }, {
          multi: true
        })
      } else {
        Answers.update(answerId, {
          $push: { likedUsers: userId }
        })
      }
    }
  })
}
