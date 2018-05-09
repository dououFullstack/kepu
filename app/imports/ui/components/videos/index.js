import React from 'react'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import InfiniteScroll from 'react-infinite-scroller'

import VideoItem from './videoItem'
import Loading from '/imports/ui/components/loading'
import Search from '/imports/ui/components/layouts/searchBar/index'

const Videos = ({ videos, loadMoreVideos, hasMore, inMine, loading }) => {
  if (inMine && loading) {
    return <Loading size='large' height='300px' />
  }

  const videoItems = videos.map((video, i) => (
    <VideoItem key={i} video={video} />
  ))

  return (
    <div id='video-list'>
      <Search placeholder='请输入视频搜索' />
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMoreVideos}
        hasMore={hasMore}
        loader={<Loading size='small' height='100px' />}
      >
        { videoItems.length ? videoItems
        : inMine ? <div className='empty-page'>
          <img className='empty-page-img' src='/images/empty-page.png' alt='empty page' />
          <h2>还没有购买任何视频</h2>
        </div> : <span>{}</span> }
      </InfiniteScroll>
    </div>
  )
}

const reactiveMapper = ({params, context, videosCount}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Videos } = Collections
  const { userId } = params

  if (userId) {
    LocalState.set('navText', '我购买的视频')
    if (Meteor.subscribe('users.current').ready()) {
      const user = Meteor.user()
      const videoIds = user.boughtVideos || []
      if (Meteor.subscribe('videos.videoIds', videoIds).ready()) {
        const videos = Videos.find({
          _id: { $in: videoIds }
        }, {
          sort: { updatedAt: -1, createdAt: -1 }
        }).fetch()
        onData(null, { videos, inMine: true, loading: false })
      } else {
        onData(null, { videos: [], inMine: true, loading: true })
      }
    }
  } else {
    const currentPage = LocalState.get('currentVideoPage') || 1
    const searchTerm = LocalState.get('searchTerm')
    const videos = Videos.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
    LocalState.set('navText', '视频')
    if (Meteor.subscribe('videos.pagination', currentPage, searchTerm).ready() && videosCount !== null) {
      onData(null, { videos, hasMore: videosCount !== videos.length, loading: false })
    } else {
      onData(null, { videos, hasMore: false, loading: true })
    }
  }
}

const videoCount = ({ context }, onData) => {
  const { LocalState, Meteor } = context
  const searchTerm = LocalState.get('searchTerm')

  Meteor.call('videos.countByUser', searchTerm, (err, res) => {
    if (!err) {
      onData(null, { videosCount: res })
    }
  })

  onData(null, { videosCount: null })
}

const depsToProps = (context, actions) => ({
  context,
  loadMoreVideos: actions.videos.loadMoreVideos
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(getTrackerLoader(videoCount)),
  useDeps(depsToProps)
)(Videos)
