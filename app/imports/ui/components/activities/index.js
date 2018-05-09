import React from 'react'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import InfiniteScroll from 'react-infinite-scroller'

import ActivityItem from './activityItem'
import Loading from '/imports/ui/components/loading'
import Search from '/imports/ui/components/layouts/searchBar/index'

const Activities = ({context, activities, loadMoreActivities, hasMore, inMine, loading}) => {
  if (inMine && loading) {
    return <Loading size='large' height='300px' />
  }

  const activityItems = activities.map((activity, i) => (
    <ActivityItem key={activity._id} activity={activity} />
  ))

  return (
    <div id='activity-list'>
      <Search placeholder='请输入活动搜索' />
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMoreActivities}
        hasMore={hasMore}
        loader={<Loading size='small' height='100px' />}
      >
        { activityItems.length ? activityItems
        : inMine ? <div className='empty-page'>
          <img className='empty-page-img' src='/images/empty-page.png' alt='empty page' />
          <h2>还没有报名任何活动</h2>
        </div> : <span>{}</span> }
      </InfiniteScroll>
    </div>
  )
}

const reactiveMapper = ({ params, context, activityCount }, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Activities, Enrollments } = Collections
  const { userId } = params

  if (userId) {
    LocalState.set('navText', '我报名的活动')
    if (Meteor.subscribe('enrollments.byUserId', userId).ready()) {
      const activityIds = []
      const enrollments = Enrollments.find({ userId: userId }).fetch()

      enrollments.map((enrollment, i) => {
        activityIds.push(enrollment.activityId)
      })

      if (Meteor.subscribe('activities.activityIds', activityIds).ready()) {
        const activities = Activities.find({
          _id: { $in: activityIds }
        }, {
          sort: { createdAt: -1 }
        }).fetch()
        onData(null, { activities, inMine: true, loading: false })
      }
    } else {
      onData(null, { activities: [], inMine: true, loading: true })
    }
  } else {
    const currentPage = LocalState.get('currentActivityPage') || 1
    const searchTerm = LocalState.get('searchTerm')
    const activities = Activities.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
    LocalState.set('navText', '活动')

    if (Meteor.subscribe('activities.pagination', currentPage, searchTerm).ready() && activityCount !== null) {
      onData(null, { activities, hasMore: activityCount !== activities.length, loading: false })
    } else {
      onData(null, { activities, hasMore: false, loading: true })
    }
  }
}

const activityCount = ({ context }, onData) => {
  const { LocalState, Meteor } = context
  const searchTerm = LocalState.get('searchTerm')

  Meteor.call('activities.countByUser', searchTerm, (err, res) => {
    if (!err) {
      onData(null, { activityCount: res })
    }
  })

  onData(null, { activityCount: null })
}

const depsToProps = (context, actions) => ({
  context,
  loadMoreActivities: actions.activities.loadMoreActivities
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(getTrackerLoader(activityCount)),
  useDeps(depsToProps)
)(Activities)
