import React from 'react'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import AnswerItem from './answerItem'

const Answers = ({answers}) => {
  const answerItems = answers.map((answer, i) => (
    <AnswerItem key={i} answer={answer} />
  ))

  return (
    <div id='answer-list' name='answers'>
      <div className='answers-header'>
        <span className='answers-count'>{answers.length}个回答</span>
      </div>
      <div className='answer-items'>
        { answerItems }
      </div>
    </div>
  )
}

const reactiveMapper = ({questionId, context}, onData) => {
  const { Meteor, Collections } = context
  const { Answers } = Collections
  if (Meteor.subscribe('answers.question', questionId).ready()) {
    const answers = Answers.find({}, { sort: { createdAt: -1 } }).fetch()
    onData(null, { answers })
  } else {
    onData(null, { answers: [] })
  }
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Answers)
