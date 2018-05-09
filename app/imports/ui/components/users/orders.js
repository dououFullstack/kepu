import React from 'react'
import { Link, browserHistory } from 'react-router'
import Button from 'antd-mobile/lib/button'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Modal from 'antd-mobile/lib/modal'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import moment from 'moment'

import Loading from '/imports/ui/components/loading'

const { alert } = Modal

const OrderItem = ({ order, refund }) => {
  const orderText = (status) => (
    <div>
      {status === 'success' ? <Button className='order-btn' type='primary' onClick={(e) => {
        alert('申请退款', '你确定要申请退款吗？', [
          { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
          { text: '确定', onPress: () => refund(e, order) }
        ])
      }}>申请退款</Button> : ''}
      {status === 'pending' ? <span className='order-status'>确认中</span> : ''}
      {status === 'refunding' ? <span className='order-status' style={{ color: '#F35D61' }}>退款中</span> : ''}
      {status === 'closed' ? <span className='order-status'>已退款</span> : ''}
      {status === 'refused' ? <span className='order-status'>拒绝退款</span> : ''}
    </div>
  )
  const productType = order.type === 'activity' ? 'activities' : 'videos'

  return (
    <div>
      <WhiteSpace />
      <Link to={`/${productType}/${order.productId}`}>
        <div className='order-item'>
          <div className='product'>
            <div className='product-img'>
              <img src={order.img && order.img.url} alt='' />
            </div>
            <div className='product-info'>
              <h2 className='product-title'>{order.title.length > 30 ? order.title.slice(0, 30) + '...' : order.title}</h2>
              <span className='product-charge'>{order.charge}<span> 元</span></span>
              <span className='order-date'>{moment(order.date).from(new Date())}</span>
            </div>
          </div>
          <div className='order-info'>
            {
              order.type === 'video'
              ? <span className='order-status'>视频无法提供退款服务</span>
              : order.refund ? orderText(order.status) : <span className='order-status'>该活动报名后不能退款</span>
            }
            <span className='order-number'>订单编号：{order.outTradeNo}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

const Orders = ({ orderList, refund, loading }) => {
  if (loading) {
    return <Loading size='large' height='300px' />
  }

  const orders = orderList.map((order, i) => (
    <OrderItem key={i} order={order} refund={refund} />
  ))

  return (
    <div id='mine-orders'>
      { orders.length ? orders
      : <div className='empty-page'>
        <img className='empty-page-img' src='/images/empty-page.png' alt='empty page' />
        <h2>空空如也~~</h2>
      </div>}
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Transactions, Activities, Videos } = Collections
  const userId = Meteor.userId()
  if (!userId) {
    browserHistory.push('/mine/login')
  }

  LocalState.set('navText', '我的订单')

  if (Meteor.subscribe('transactions.byUserId', userId).ready()) {
    const transactions = Transactions.find({ userId: userId }).fetch()
    const activityIds = []
    const videoIds = []

    // 从订单中拿出需要订阅的数据 id 列表
    transactions.map((transaction, i) => {
      if (transaction.type === 'activity') {
        activityIds.push(transaction.productId)
      } else {
        videoIds.push(transaction.productId)
      }
    })

    // 订阅数据
    if (Meteor.subscribe('activities.activityIds', activityIds).ready() &&
        Meteor.subscribe('videos.videoIds', videoIds).ready()) {
      const orderList = []

      // 再次遍历订单匹配商品的标题和图片等信息
      transactions.map((transaction, i) => {
        let product

        if (transaction.type === 'activity') {
          product = Activities.findOne({ _id: transaction.productId })
        } else {
          product = Videos.findOne({ _id: transaction.productId })
        }

        if (product) {
          orderList.push({
            id: transaction._id,
            productId: transaction.productId,
            title: product.title,
            refund: transaction.refund,
            type: transaction.type,
            img: product.defaultImage,
            charge: product.charge,
            date: transaction.createdAt,
            status: transaction.status,
            outTradeNo: transaction.out_trade_no
          })
        }
      })

      onData(null, { orderList, loading: false })
    } else {
      onData(null, { orderList: [], loading: true })
    }
  } else {
    onData(null, { orderList: [], loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  refund: actions.users.refund
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Orders)
