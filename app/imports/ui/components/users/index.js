import React from 'react'
import { browserHistory } from 'react-router'
import Avatar from 'antd/lib/avatar'
import List from 'antd-mobile/lib/list'
import WhiteSpace from 'antd-mobile/lib/white-space'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

const { Item } = List

const Mine = ({
  context,
  user,
  activityCount,
  videoCount,
  answerCount,
  questionCount,
  orderCount
}) => {
  const { UserRoles } = context
  const { FRONTADMIN, hasPermission } = UserRoles

  return (
    <div id='mine' style={{ paddingBottom: '60px' }}>
      <div className='mine-head'>
        <h2>我的</h2>
        <Avatar className='mine-avatar' src={user.profile.headimgurl} />
        <span className='mine-name'>{user.profile.nickname}</span>
        <span className='mine-uid'>ID:{user.username}</span>
        {/* <img className='mine-chat' src='/images/mine-8@2x.png' alt='chat' /> */}
      </div>
      <WhiteSpace />
      <List>
        <Item
          thumb='/images/mine-2@2x.png'
          arrow='horizontal'
          extra={`${activityCount}个`}
          onClick={(e) => { browserHistory.push(`/mine/activities/${user._id}`) }}
        >我报名的活动</Item>
        <Item
          thumb='/images/mine-10@2x.png'
          arrow='horizontal'
          extra={`${videoCount}个`}
          onClick={(e) => { browserHistory.push(`/mine/videos/${user._id}`) }}
        >我购买的视频</Item>
        <Item
          thumb='/images/mine-3@2x.png'
          arrow='horizontal'
          extra={`${answerCount}个`}
          onClick={(e) => { browserHistory.push(`/mine/answers/${user._id}`) }}
        >我的回答</Item>
        <Item
          thumb='/images/mine-4@2x.png'
          arrow='horizontal'
          extra={`${questionCount}个`}
          onClick={(e) => { browserHistory.push(`/mine/questions/${user._id}`) }}
        >我的提问</Item>
        <Item
          thumb='/images/mine-5@2x.png'
          arrow='horizontal'
          extra={`${orderCount}个`}
          onClick={(e) => { browserHistory.push(`/mine/orders`) }}
        >我的订单</Item>

        { hasPermission(user.roles, FRONTADMIN) ? <Item
          thumb='/images/mine-9@2x.png'
          arrow='horizontal'
          onClick={(e) => { browserHistory.push(`/mine/inviteCodes`) }}
        >邀请专家</Item> : '' }

      </List>
      <WhiteSpace />
      <List>
        <Item
          thumb='/images/mine-6@2x.png'
          arrow='horizontal'
          onClick={(e) => { browserHistory.push(`/mine/updateProfile`) }}
        >完善信息</Item>
        <Item
          thumb='/images/mine-7@2x.png'
          arrow='horizontal'
          onClick={(e) => { browserHistory.push(`/mine/changePassword`) }}
        >修改密码</Item>
        <Item
          thumb='/images/mine-logout@2x.png'
          arrow='horizontal'
          onClick={(e) => { Meteor.logout() }}
        >退出登录</Item>
      </List>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { LocalState, Accounts, Meteor } = context
  const activityCount = LocalState.get('activityCount') || 0
  const videoCount = LocalState.get('videoCount') || 0
  const answerCount = LocalState.get('answerCount') || 0
  const questionCount = LocalState.get('questionCount') || 0
  const orderCount = LocalState.get('orderCount') || 0
  LocalState.set('showNavBar', false)

  if (Accounts.loginServicesConfigured() &&
      Meteor.subscribe('users.current').ready()) {
    const user = Meteor.user()

    if (user && user.username) {
      Meteor.call('user.boughtActivityCount', user._id, (err, res) => {
        if (!err) {
          LocalState.set('activityCount', res || 0)
        }
      })

      Meteor.call('user.boughtVideoCount', user._id, (err, res) => {
        if (!err) {
          LocalState.set('videoCount', res || 0)
        }
      })

      Meteor.call('answers.count', user._id, (err, res) => {
        if (!err) {
          LocalState.set('answerCount', res || 0)
        }
      })

      Meteor.call('questions.countByUserId', user._id, (err, res) => {
        if (!err) {
          LocalState.set('questionCount', res || 0)
        }
      })

      Meteor.call('transactions.countByUserId', user._id, (err, res) => {
        if (!err) {
          LocalState.set('orderCount', res || 0)
        }
      })

      // 未登录或已经登录未绑定账号
      onData(null, { user, activityCount, videoCount, answerCount, questionCount, orderCount })
    } else {
      browserHistory.push('/mine/login')
    }
  }
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Mine)
