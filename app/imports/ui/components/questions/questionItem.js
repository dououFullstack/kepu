import React from 'react'
import { Link } from 'react-router'
import Avatar from 'antd/lib/avatar'
import Icon from 'antd/lib/icon'
import Card from 'antd-mobile/lib/card'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import { dateToString2 } from '/imports/lib/helpers'

const QuestionItem = ({question, reply, loadMore}) => {
  const images = question.attachments ? question.attachments.map((image, i) => (
    <Col key={i} span={8}>
      <img src={image.url} alt={image.name} />
    </Col>
  )) : ''

  return (
    <Link to={`/questions/${question._id}`}>
      <Card className='question-item'>
        <div className='question-header'>
          <Avatar className='question-avatar' src={question.avatar || '/images/mine@2x.png'} />
          <span className='question-author'>{question.author}</span>
          <span className='question-date'>{dateToString2(question.createdAt)}</span>
        </div>
        <div className='question-content'>
          <h3 className='question-title'>{question.title}</h3>
          <Row gutter={8} className='question-images'>
            { images }
          </Row>
          <p className='question-summary'>
            { question.content && question.content.length > 70 ? question.content.slice(0, 70) + '...' : question.content }
          </p>
          {
            question.content && question.content.length > 70
            ? <span className='load-more' onClick={(e) => loadMore(e, question._id)}>查看全文</span>
            : ''
          }
        </div>
        <div className='question-footer'>
          <Icon className='comments-icon' style={question.answerTotal > 0 ? {color: '#007aff'} : { color: '#999' }} type='message' />
          <span className='comments-count'
            style={question.answerTotal > 0 ? {color: '#007aff'} : { color: '#999' }}
            onClick={(e) => loadMore(e, question._id, '#answer-list')}>
            {question.answerTotal}条回答
          </span>
        </div>
      </Card>
    </Link>
  )
}

const reactiveMapper = ({context}, onData) => {
  onData(null, { })
}

const depsToProps = (context, actions) => ({
  context,
  loadMore: actions.questions.loadMore,
  reply: actions.questions.reply
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(QuestionItem)
