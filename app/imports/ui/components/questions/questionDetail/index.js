import React from 'react'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd-mobile/lib/button'
import Modal from 'antd-mobile/lib/modal'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Answers from './answers'
import Loading from '/imports/ui/components/loading'
import { dateToString } from '/imports/lib/helpers'

const { alert } = Modal

const QuestionDetail = ({user, question, loading, reply, deleteQuestion}) => {
  if (loading || !question) {
    return <Loading size='large' height='300px' />
  }

  const images = question.attachments ? question.attachments.map((image, i) => (
    <Col key={i} span={8}>
      <img src={image.url} alt={image.name} />
    </Col>
  )) : ''

  return (
    <div id='question-detail'>
      <div className='question-info' onClick={(e) => {
        if (user._id === question.userId) {
          alert('删除', '你确定要删除这个提问吗？', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => deleteQuestion(question._id) }
          ])
        }
      }}>
        <h2 className='question-title'>{question.title}</h2>
        <span className='question-date'>发布时间：{dateToString(question.createdAt)}</span>
        <Row gutter={8} className='question-images'>
          { images }
        </Row>
        <p className='question-content'>{question.content}</p>
      </div>
      <Answers questionId={question._id} />
      <div className='reply-question-btn'>
        <Button
          className='btn'
          type='primary'
          onClick={(e) => { reply(e, question._id) }}>
          我来回答
        </Button>
      </div>
    </div>
  )
}

const reactiveMapper = ({params, context}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Questions } = Collections
  const user = Meteor.user()
  LocalState.set('navText', '问答详情')
  if (Meteor.subscribe('questions.question', params.questionId).ready()) {
    const question = Questions.findOne(params.questionId)
    onData(null, { user: user || {}, question, loading: false })
  } else {
    onData(null, { user: {}, question: {}, loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  reply: actions.questions.reply,
  deleteQuestion: actions.questions.deleteQuestion
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(QuestionDetail)
