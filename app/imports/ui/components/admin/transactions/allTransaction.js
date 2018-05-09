import React from 'react'
import { Link } from 'react-router'
import Table from 'antd/lib/table'
import Input from 'antd/lib/input'
import WhiteSpace from 'antd-mobile/lib/white-space'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import { dateToString2 } from '/imports/lib/helpers'

const { Column } = Table
const { Search } = Input

const AllTransaction = ({
  context,
  transactions,
  searchSubmit,
  searchTerm,
  resetSearch,
  activityCount,
  currentPage,
  loading
}) => {
  const { LocalState } = context
  const dataSource = []

  transactions.map((tran, i) => {
    dataSource.push({
      key: tran._id,
      user: tran.username,
      out_trade_no: tran.out_trade_no,
      productId: tran.productId,
      type: tran.type,
      totalFee: tran.total_fee,
      status: tran.status,
      transactionId: tran.transaction_id,
      createdAt: dateToString2(tran.createdAt)
    })
  })

  const pagination = {
    total: activityCount,
    current: currentPage,
    onChange: (page, pageSize) => {
      LocalState.set('currentTransactionPage', page)
    }
  }

  return (
    <div className='all-transaction'>
      <div className='transactions-header'>
        <div className='search-input'>
          { searchTerm ? <Link className='showAll' onClick={(e) => {
            resetSearch()
          }}>显示全部</Link> : '' }
          <Search
            placeholder='输入你要搜索的订单'
            defaultValue={searchTerm}
            onSearch={value => searchSubmit(value)}
          />
        </div>
      </div>
      <WhiteSpace />
      <Table dataSource={dataSource} pagination={pagination} loading={loading}>
        <Column
          title='订单号'
          dataIndex='out_trade_no'
          key='out_trade_no'
        />
        <Column
          title='用户'
          dataIndex='user'
          key='user'
        />
        <Column
          title='交易类型'
          dataIndex='type'
          key='type'
          render={(text, record) => {
            return text === 'activity' ? '活动' : '视频'
          }}
        />
        <Column
          title='金额'
          dataIndex='totalFee'
          key='totalFee'
          render={(text) => (
            `${text / 100}元`
          )}
        />
        <Column
          title='订单状态'
          dataIndex='status'
          key='status'
          render={(text) => {
            switch (text) {
              case 'refunding':
                return '申请退款'
              case 'success':
                return '交易成功'
              case 'closed':
                return '已退款'
              case 'pending':
                return '未支付'
            }
          }}
        />
        <Column
          title='创建时间'
          dataIndex='createdAt'
          key='createdAt'
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context, transactionsCount}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Transactions } = Collections
  const pageSize = 10
  const currentPage = LocalState.get('currentTransactionPage') || 1
  const searchTerm = LocalState.get('searchTerm')

  if (Meteor.subscribe('transactions.pagination', currentPage, searchTerm).ready() && transactionsCount !== null) {
    const transactions = Transactions.find({}, {
      sort: { createdAt: -1 },
      skip: pageSize * (currentPage - 1),
      limit: pageSize
    }).fetch()
    onData(null, { transactions, searchTerm, currentPage, transactionsCount, loading: false })
  } else {
    onData(null, { transactions: [], searchTerm: null, loading: true })
  }
}

const transactionsCount = ({ context }, onData) => {
  const { Meteor } = context
  Meteor.call('transactions.count', (err, res) => {
    if (!err) {
      onData(null, { transactionsCount: res })
    }
  })
  onData(null, { transactionsCount: null })
}

const depsToProps = (context, actions) => ({
  context,
  searchSubmit: actions.admin.searchSubmit,
  resetSearch: actions.admin.resetSearch
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(transactionsCount),
  useDeps(depsToProps)
)(AllTransaction)
