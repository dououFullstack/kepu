export default ({ Meteor, Collections, check, Match, UserRoles, Roles }) => {
  const { Questions, Answers, GlobalSettings } = Collections

  Meteor.methods({
    'questions.create' (title, content, fileList, invitationIds) {
      check(title, String)
      check(content, Match.OneOf(String, null, undefined))
      check(fileList, Array)
      check(invitationIds, Array)

      if (!Meteor.userId()) {
        throw new Meteor.Error(400, '请登录后重试！')
      }

      const user = Meteor.user()
      if (user && user.isBan) {
        throw new Meteor.Error(401, '你已经被禁言，无法发表新问题。')
      }

      const showTime = new Date()
      const time = GlobalSettings.findOne({ key: 'showTime' })
      showTime.setHours(showTime.getHours() + +time.value)

      const res = Questions.insert({
        title,
        content,
        userId: user._id,
        author: user.profile.nickname,
        avatar: user.profile.headimgurl || '',
        attachments: fileList,
        invitationIds: invitationIds,
        showTime: showTime
      })

      return res
    },
    'questions.update' () {
      //
    },
    'questions.delete' (questionId, userId) {
      check(questionId, String)
      check(userId, String)

      const question = Questions.findOne(questionId)
      if (!question) {
        throw new Meteor.Error(400, '未知的问题编号')
      }

      if (question.userId === userId || Roles.userIsInRole(userId, UserRoles.ADMIN)) {
        Questions.remove(questionId)
        Answers.remove({ questionId: questionId })
      } else {
        throw new Meteor.Error(401, '你无权删除此提问')
      }
    },
    'questions.countByUserId' (userId) {
      check(userId, String)
      return Questions.find({ userId: userId }).count()
    },
    'questions.removeByIds' (questionIds) {
      check(questionIds, Array)

      if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        Answers.remove({ questionId: { $in: questionIds } })
        return Questions.remove({ _id: { $in: questionIds } })
      } else {
        throw new Meteor.Error(400, '你无权删除问题')
      }
    },
    'questions.setVisible' (questionId, isVisible) {
      check(questionId, String)
      check(isVisible, Boolean)

      if (Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        return Questions.update(questionId, {
          $set: { isVisible: isVisible }
        })
      } else {
        throw new Meteor.Error(400, '你没有权限设置问题属性')
      }
    },
    'questions.count' () {
      if (!Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '你无权获取问题总数')
      }
      return Questions.find({}).count()
    },
    'questions.countByUser' (searchTerm) {
      check(searchTerm, Match.OneOf(String, null, undefined))

      let query = {}
      const nowTime = new Date()
      const or = []

      or.push({
        isVisible: null, showTime: { $lte: nowTime }
      }, {
        isVisible: true
      })

      if (searchTerm) {
        const regex = new RegExp(searchTerm, 'i')
        Object.assign(query, {
          title: regex
        })
      }

      Object.assign(query, { $or: or })
      return Questions.find(query).count()
    },
    'questions.viewCount' (questionId) {
      check(questionId, String)

      const question = Questions.findOne(questionId)
      if (question && !question.viewCount) {
        Questions.update(questionId, {
          $set: { viewCount: 0 }
        })
      }

      return Questions.update(questionId, {
        $inc: { viewCount: 1 }
      })
    }
  })
}
