export default ({ Meteor, Collections, check, Match, Roles, UserRoles }) => {
  const { Transactions } = Collections
  const DEVELOPMENT = Meteor.isDevelopment

  Meteor.publish('transactions.pagination', function (currentPage, searchTerm, pageSize = 10) {
    check(currentPage, Number)
    check(searchTerm, Match.OneOf(String, null, undefined))
    if (DEVELOPMENT) Meteor._sleepForMs(500)

    const query = {
      status: { $ne: 'pending' }
    }
    const projection = {
      sort: { updatedAt: -1, createdAt: -1 }
    }

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')
      Object.assign(query, {
        $or: [
          { username: regex },
          { out_trade_no: regex }
        ]
      })
    }

    Object.assign(projection, {
      limit: pageSize * currentPage
    })

    return Transactions.find(query, projection)
  })

  Meteor.publish('transactions.byUserId', function (userId) {
    check(userId, String)

    if (!this.userId) {
      throw new Meteor.Error(400, '请登录后重试')
    }

    return Transactions.find({
      userId: userId,
      status: { $ne: 'pending' }
    })
  })

  Meteor.publish('transactions.refund', function (searchTerm, currentPage = 1, pageSize = 10) {
    if (!Roles.userIsInRole(this.userId, UserRoles.ADMIN)) {
      throw new Meteor.Error(400, '你无权获取订单列表')
    }

    const query = { status: 'refunding' }
    const projection = {
      limit: pageSize,
      skip: (currentPage - 1) * pageSize,
      createdAt: -1
    }

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')
      Object.assign(query, {
        $or: [
          { username: regex },
          { out_trade_no: regex }
        ]
      })
    }

    return Transactions.find(query, projection)
  })
}
