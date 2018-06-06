import React from 'react'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd-mobile/lib/button'
import Modal from 'antd-mobile/lib/modal'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import styled from 'styled-components'

import Answers from './answers'
import Loading from '/imports/ui/components/loading'
import { dateToString } from '/imports/lib/helpers'

const { alert } = Modal

const Desc = styled.div`
  font-size: 12px;
  background-color: #FFFFFF;
`

const QuestionDetail = ({user, question, loading, reply, deleteQuestion}) => {
  if (loading || !question) {
    return <Loading size='large' height='300px' />
  }

  const images = question.attachments ? question.attachments.map((image, i) => (
    <Col key={i} span={8}>
      <img src={image.url} alt={image.name} />
    </Col>
  )) : ''

  const str = question.content.replace(/\n/g, '<br />')

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
        <Desc className='question-content' dangerouslySetInnerHTML={{ __html: str}}>
        </Desc>
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

const reactiveMapper = ({params, context, result}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Questions } = Collections
  const user = Meteor.user()
  LocalState.set('navText', '问答详情')
  if (Meteor.subscribe('users.current').ready() && result &&
    Meteor.subscribe('questions.question', params.questionId).ready()) {
    const question = Questions.findOne(params.questionId)
    const imgUrl = question.attachments.length == 0 ? 'https://cdn.douhs.com/default.jpg'   : question.attachments[0].url
    // console.log('imgUrl', imgUrl)

    const shareConfig = {
      share: {
        imgUrl,
        title: `${question.title} - 互动科普`,
        desc: question.content.substr(0, 30),
        link: window.location.href,
        success () {
          // 分享成功后的回调函数
        },
        cancel () {
          // 用户取消分享后执行的回调函数
        }
      }
    }
    wx.config({
      debug: false,
      appId: result.appId,
      timestamp: result.timestamp,
      nonceStr: result.nonceStr,
      signature: result.signature,
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ'
      ]
    })
    wx.ready(() => {
      wx.onMenuShareAppMessage(shareConfig.share)
      wx.onMenuShareTimeline(shareConfig.share)
      wx.onMenuShareQQ(shareConfig.share)
    })

    onData(null, { user: user || {}, question, loading: false })
  } else {
    onData(null, { user: {}, question: {}, loading: true })
  }
}

const wechat = ({ context }, onData) => {
  const { Meteor } = context
  Meteor.call('wechat.signature', window.location.href, (error, result) => {
    if (!error) onData(null, { result })
  })
  onData(null, {})
}

const depsToProps = (context, actions) => ({
  context,
  reply: actions.questions.reply,
  deleteQuestion: actions.questions.deleteQuestion
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(wechat, { propsToWatch: [] }),
  useDeps(depsToProps)
)(QuestionDetail)
