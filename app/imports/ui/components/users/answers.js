import React from 'react'
import { browserHistory, Link } from 'react-router'
import Tabs from 'antd-mobile/lib/tabs'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Button from 'antd-mobile/lib/button'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Loading from '/imports/ui/components/loading'
import moment from 'moment'

const AnswerItem = ({question, answer, showReplyButton}) => {
  return (
    <div className='myanswer-item'>
      <Link to={`/questions/${question._id}`}>
        <h2>{question.title}</h2>
        <span className='question-date'>
          {moment(question.createdAt).from(new Date())}
        </span>
        <div className='answer-content'
          style={showReplyButton ? { marginBottom: '50px' } : { marginBottom: '28px' }}>
          { showReplyButton ? ''
            : <div>
              <p>我的回答：</p>
              <p>{answer.content}</p>
            </div>
          }
        </div>
        { !showReplyButton ? ''
          : <Button className='reply-btn' type='primary' onClick={(e) => {
            browserHistory.push(`/questions/${question._id}`)
          }}>
            马上回答
          </Button>
        }
      </Link>
    </div>
  )
}

const MyAnswers = ({ context, questions, answerList, user, loading }) => {
  const { UserRoles } = context
  const { EXPERT, hasPermission } = UserRoles
  const tabs = []

  if (loading) {
    return <Loading size='large' height='300px' />
  }

  if (!hasPermission(EXPERT, user.roles)) {
    tabs.push(
      { title: '已回答' }
    )
  } else {
    tabs.push(
      { title: '已回答' },
      { title: '待回答' }
    )
  }

  return (
    <div id='my-answers'>
      <Tabs tabs={tabs}
        initialPage={0}
      >
        <div>
          {
            answerList.length ? answerList.map((answer, i) => {
              return (
                <div key={i}>
                  <WhiteSpace />
                  <AnswerItem
                    question={answer.question}
                    answer={answer.answer}
                    showReplyButton={Boolean(false)}
                  />
                </div>
              )
            })
            : <div className='empty-page'>
              <img className='empty-page-img' src='/images/empty-page.png' alt='empty page' />
              <h2>还没有回答的问题，赶快去问答板块看看吧</h2>
            </div>
          }
        </div>
        <div>
          {
            questions.length ? questions.map((question, i) => {
              return (
                <div key={i}>
                  <WhiteSpace />
                  <AnswerItem
                    question={question}
                    showReplyButton={Boolean(true)}
                  />
                </div>
              )
            })
            : <div className='empty-page'>
              <img className='empty-page-img' src='/images/empty-page.png' alt='empty page' />
              <h2>没有待回答的问题</h2>
            </div>
          }
        </div>
      </Tabs>
    </div>
  )
}

const reactiveMapper = ({params, context}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Questions, Answers } = Collections
  const { userId } = params
  const user = Meteor.user()

  LocalState.set('navText', '我的回答')

  if (Meteor.subscribe('answers.byUserId', userId).ready() &&
      Meteor.subscribe('questions.byInvited', userId).ready()) {
    // 待回答的问题列表（被邀请回答的）
    const questions = Questions.find({ invitationIds: { $elemMatch: { $in: [userId] } } }).fetch()

    // 已回答的问题列表
    const answers = Answers.find({ userId: userId }).fetch()

    let questionIds = []
    answers.map((answer, i) => {
      questionIds.push(answer.questionId)
    })

    if (Meteor.subscribe('questions.questionIds', questionIds).ready()) {
      let answerList = []
      answers.map((answer, i) => {
        const question = Questions.findOne(answer.questionId)
        if (question) {
          answerList.push({
            question: question,
            answer: answer
          })
        }
      })
      onData(null, { questions, answerList, user, loading: false })
    }
  } else {
    onData(null, { questions: [], answerList: [], user, loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(MyAnswers)
