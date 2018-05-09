import React from 'react'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import Table from 'antd/lib/table'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import DateToString from '/imports/lib/dateToString'
import Loading from '/imports/ui/components/loading'

const { Column } = Table

const AdminAnswers = ({
  answers,
  loading
}) => {
  if (loading) {
    return <Loading size='large' height='300px' />
  }

  const dataSource = []
  answers.map((d, i) => {
    dataSource.push({
      content: d.content.length > 30 ? d.content.slice(0, 30) + '...' : d.content,
      userId: d.userId,
      author: d.author,
      likedTotal: d.likedUsers ? d.likedUsers.length : 0,
      createdAt: DateToString(d.createdAt)
    })
  })

  return (
    <div>
      <Table dataSource={dataSource}>
        <Column
          title='回复内容'
          dataIndex='content'
          key='content'
        />
        <Column
          title='作者'
          dataIndex='author'
          key='author'
        />
        <Column
          title='点赞总数'
          dataIndex='likedTotal'
          key='likedTotal'
        />
        <Column
          title='创建时间'
          dataIndex='createdAt'
          key='createdAt'
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({params, context}, onData) => {
  const { Meteor, Collections } = context
  const { Answers } = Collections
  const { questionId } = params

  if (Meteor.subscribe('answers.question', questionId).ready()) {
    const answers = Answers.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
    onData(null, { answers, loading: false })
  } else {
    onData(null, { answers: [], loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(AdminAnswers)
