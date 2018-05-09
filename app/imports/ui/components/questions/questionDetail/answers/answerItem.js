import React from 'react'
import Avatar from 'antd/lib/avatar'
import Modal from 'antd-mobile/lib/modal'
import Icon from 'antd/lib/icon'
import _ from 'underscore'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import { dateToString2 } from '/imports/lib/helpers'

const { alert } = Modal

const AnswerItem = ({user, answer, isOwner, isLiked, likedCount, deleteAnswer, like}) => {
  return (
    <div className='answer-item'>
      <div className='answer-header'>
        <Avatar className='answer-avatar' src={answer.avatar} />
        <span className='answer-author'>{answer.author}</span>
        <span className='like' onClick={(e) => { like(e, answer._id, isLiked) }}>
          <Icon type={isLiked ? 'like' : 'like-o'} />
          <span className='like-count'>{likedCount}</span>
        </span>
        { isOwner
        ? <span className='delete' onClick={(e) => {
          if (user._id === answer.userId) {
            alert('删除', '你确定要删除这个回答吗？', [
              { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
              { text: '确定', onPress: () => deleteAnswer(answer._id) }
            ])
          }
        }}>
          <Icon type='delete' />
        </span>
        : ''}
      </div>
      <div className='answer-content'>
        <p>{answer.content}</p>
      </div>
      <div className='answer-footer'>
        <span className='answer-date'>{dateToString2(answer.date)}</span>
      </div>
    </div>
  )
}

const reactiveMapper = ({answer, context}, onData) => {
  const { Meteor } = context
  const likedCount = answer.likedUsers.length
  const user = Meteor.user()
  if (user) {
    const isOwner = answer.userId === user._id
    const isLiked = _.indexOf(answer.likedUsers, user._id) !== -1
    onData(null, { user, isLiked, likedCount, isOwner })
  } else {
    onData(null, { user: {}, isLiked: false, likedCount, isOwner: false })
  }
}

const depsToProps = (context, actions) => ({
  context,
  deleteAnswer: actions.questions.deleteAnswer,
  like: actions.questions.like
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(AnswerItem)
