import React from 'react'
import { browserHistory } from 'react-router'
import TextareaItem from 'antd-mobile/lib/textarea-item'
import Button from 'antd-mobile/lib/button'
import { createForm } from 'rc-form'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import { dateToString } from '/imports/lib/helpers'

const ReplyQuestion = ({question, form, submitAnswer}) => {
  const { getFieldProps } = form
  return (
    <div className='reply-question'>
      <div className='question-info'>
        <h2 className='question-title'>{question.title}</h2>
        <span className='question-date'>发布时间：{dateToString(question.createdAt)}</span>
      </div>
      <TextareaItem
        className='text-container'
        placeholder='请输入您的回答内容'
        {...getFieldProps('content', {
          rules: [{ required: true, message: '请输入要回复的内容！' }]
        })}
        rows={5}
        count={500}
      />
      <div className='submit-answer'>
        <Button
          className='btn'
          type='primary'
          onClick={e => { submitAnswer(e, question._id, form) }}
        >
          立即回答
        </Button>
      </div>
    </div>
  )
}

const reactiveMapper = ({params, context}, onData) => {
  const { Meteor, Collections, Session } = context
  const { Questions } = Collections
  if (Meteor.subscribe('users.current').ready() &&
      Meteor.subscribe('questions.question', params.questionId).ready()) {
    const user = Meteor.user()
    if (!user || !(user && user.username)) {
      Session.set('redirectUrl', `/replyQuestion/${params.questionId}`)
      browserHistory.push('/mine/login')
    } else {
      const question = Questions.findOne(params.questionId)
      onData(null, { question })
    }
  } else {
    onData(null, { question: {} })
  }
}

const depsToProps = (context, actions) => ({
  context,
  submitAnswer: actions.questions.submitAnswer
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(createForm()(ReplyQuestion))
