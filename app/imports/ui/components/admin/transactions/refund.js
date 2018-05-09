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

const RefundMgr = ({
  context,
  transactions,
  doRefund,
  searchTerm,
  refundCount,
  currentPage,
  resetSearch,
  searchSubmit,
  loading
}) => {
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

  const { LocalState } = context
  const pagination = {
    total: refundCount,
    current: currentPage,
    onChange: (page, pageSize) => {
      LocalState.set('state.transactions.currentPage', page)
    }
  }

  return (
    <div className='admin-refund-mgr'>
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
            return text === 'activity'
            ? <Link to={`/activities/${record.productId}`}>活动</Link>
            : <Link to={`/videos/${record.productId}`}>视频</Link>
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
          render={(text) => (
            text === 'refunding' ? '申请退款' : ''
          )}
        />
        <Column
          title='创建时间'
          dataIndex='createdAt'
          key='createdAt'
        />
        <Column
          title='操作'
          key='action'
          render={(text, record) => {
            const data = {
              id: record.key,
              transaction_id: record.transactionId,
              total_fee: record.totalFee
            }

            return <span>
              <Link onClick={(e) => { doRefund(e, data, true) }}>同意退款</Link>
              <span className='ant-divider' />
              <Link onClick={(e) => { doRefund(e, data, false) }} style={{color: '#F04134'}}>拒绝退款</Link>
            </span>
          }}
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context, refundCount}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Transactions } = Collections
  const searchTerm = LocalState.get('state.transactions.refund.searchTerm') || null
  const currentPage = LocalState.get('state.transactions.currentPage') || 1
  if (Meteor.subscribe('transactions.refund', searchTerm, currentPage).ready() && refundCount >= 0) {
    const transactions = Transactions.find({
      status: 'refunding'
    }, {
      sort: { createdAt: -1 }
    }).fetch()
    onData(null, { transactions, searchTerm, refundCount, currentPage, loading: false })
  } else {
    onData(null, { transactions: [], searchTerm, refundCount, currentPage, loading: true })
  }
}

const getRefundCount = ({context}, onData) => {
  const { Meteor } = context
  Meteor.call('transactions.refundCount', (err, refundCount) => {
    if (!err) {
      onData(null, { refundCount })
    } else {
      onData(null, { refundCount: null })
    }
  })
}

const depsToProps = (context, actions) => ({
  context,
  doRefund: actions.admin.doRefund,
  searchSubmit: (value) => {
    const { LocalState } = context
    LocalState.set('state.transactions.refund.searchTerm', value)
  },
  resetSearch: () => {
    const { LocalState } = context
    LocalState.set('state.transactions.refund.searchTerm', null)
  }
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(getTrackerLoader(getRefundCount)),
  useDeps(depsToProps)
)(RefundMgr)
