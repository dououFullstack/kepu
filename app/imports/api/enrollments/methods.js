export default ({ Meteor, Collections, check }) => {
  const { Enrollments, Users } = Collections

  Meteor.methods({
    'enrollments.create' (enrollment, noPay = false) {
      check(enrollment, Object)

      const user = Meteor.user()
      if (!user) {
        throw new Meteor.Error(400, '请登录后重试！')
      }

      // 如果不是支付渠道进来的，则直接显示用户已经报名
      if (noPay) {
        Users.update(enrollment.userId, {
          $push: { boughtActivities: enrollment.activityId }
        })
      }

      return Enrollments.insert(enrollment)
    },
    'enrollments.update' () {
      //
    },
    'enrollments.delete' () {
      //
    }
  })
}
