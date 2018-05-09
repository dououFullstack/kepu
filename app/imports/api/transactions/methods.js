export default ({ Meteor, Collections, Random, Roles, UserRoles, Accounts, check }) => {
  const { Transactions } = Collections

  Meteor.methods({
    'transactions.applyRefund' (orderId) {
      check(orderId, String)

      const transaction = Transactions.findOne(orderId)

      if (!transaction) {
        throw new Meteor.Error(400, '未找到该订单')
      }

      Transactions.update(orderId, {
        $set: { status: 'refunding' }
      })
    },
    'transactions.count' () {
      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '你无权获取交易总数')
      }

      return Transactions.find().count()
    },
    'transactions.refundCount' () {
      if (!Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN)) {
        throw new Meteor.Error(400, '你无权获取交易总数')
      }

      return Transactions.find({ status: 'refunding' }).count()
    },
    'transactions.countByUserId' (userId) {
      check(userId, String)
      return Transactions.find({
        userId: userId,
        status: { $nin: ['pending'] }
      }).count()
    }
  })
}
