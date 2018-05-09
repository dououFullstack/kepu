import React from 'react'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import InfiniteScroll from 'react-infinite-scroller'

import QuestionItem from './questionItem'
import Loading from '../loading'
import Search from '/imports/ui/components/layouts/searchBar/index'

const Questions = ({ questions, loadMoreQuestions, hasMore, inMine, loading }) => {
  if (inMine && loading) {
    return <Loading size='large' height='300px' />
  }

  const questionItems = questions.map((question, i) => {
    return (
      <QuestionItem key={question._id} question={question} />
    )
  })

  return (
    <div id='question-list'>
      <Search placeholder='请输入问题搜索' />
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMoreQuestions}
        hasMore={hasMore}
        loader={<Loading size='small' height='100px' />}
      >
        {questionItems.length ? questionItems
        : inMine ? <div className='empty-page'>
          <img className='empty-page-img' src='/images/empty-page.png' alt='empty page' />
          <h2>还没有发起任何提问</h2>
        </div> : <span>{}</span>}
      </InfiniteScroll>
    </div>
  )
}

const reactiveMapper = ({params, context, result, questionCount}, onData) => {
  const { Meteor, Collections, LocalState, wx } = context
  const { Questions } = Collections
  const { userId } = params

  // 新建完提问回到问题列表时清除新建问题留下的本地缓存
  LocalState.set('fileList', [])
  LocalState.set('selectedTags', [])

  // 带有 userId 参数证明是从“我的”页面点击查看我的提问而跳转到此处的
  if (userId) {
    LocalState.set('navText', '我的提问')
    if (Meteor.subscribe('questions.byUserId', userId).ready()) {
      const questions = Questions.find({ userId: userId }, { sort: { createdAt: -1 } }).fetch()
      onData(null, { questions, inMine: true, loading: false })
    } else {
      onData(null, { questions: [], inMine: true, loading: true })
    }
  } else {
    const currentPage = LocalState.get('currentQuestionPage') || 1
    const searchTerm = LocalState.get('searchTerm')
    const questions = Questions.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
    LocalState.set('navText', '问答')

    if (Meteor.subscribe('questions.pagination', currentPage, searchTerm).ready() && result && questionCount !== null) {
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
      })

      onData(null, { questions, hasMore: questionCount !== questions.length, loading: false })
    } else {
      onData(null, { questions, hasMore: false, loading: true })
    }
  }
}

const questionCount = ({ context }, onData) => {
  const { LocalState, Meteor } = context
  const searchTerm = LocalState.get('searchTerm')

  Meteor.call('questions.countByUser', searchTerm, (err, res) => {
    if (!err) {
      onData(null, { questionCount: res })
    }
  })

  onData(null, { questionCount: null })
}

const wechat = ({ context, location }, onData) => {
  const { Meteor } = context
  Meteor.call('wechat.signature', window.location.href, (error, result) => {
    if (!error) onData(null, { result })
  })
  onData(null, {})
}

const depsToProps = (context, actions) => ({
  context,
  loadMoreQuestions: actions.questions.loadMoreQuestions
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(getTrackerLoader(questionCount)),
  compose(wechat),
  useDeps(depsToProps)
)(Questions)
