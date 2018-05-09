import React from 'react'
import Button from 'antd-mobile/lib/button'
import Modal from 'antd-mobile/lib/modal'
import _ from 'underscore'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Loading from '/imports/ui/components/loading'
import { dateToString } from '/imports/lib/helpers'
import VideoPlayer from './videoPlayer'

const VideoDetail = ({
  context,
  videoId,
  video,
  loading,
  paid,
  showPayPoster,
  boughtVideo
}) => {
  if (loading) {
    return <Loading size='large' height='300px' />
  }

  let seconds

  if (video.charge === 0) {                 // 免费
    seconds = -1
  } else if (video.charge !== 0 && paid) {  // 付费且已经购买
    seconds = 0
  } else if (video.charge !== 0 && !paid) { // 付费，尚未购买
    seconds = video.freeTime
  }

  const { LocalState } = context
  const options = {
    LocalState,
    autoplay: false,
    controls: true,
    seconds,
    paid,
    videoId,
    poster: video.defaultImage.url,
    sources: [{
      src: video.defaultVideo.url,
      type: 'video/mp4'
    }]
  }

  return (
    <div id='video-detail'>
      <div className='video-control'>
        <VideoPlayer { ...options} />
      </div>
      <div className='video-info'>
        <h2 className='video-title'>{video.title}</h2>
        <span className='video-date'>{dateToString(video.date)}</span>
      </div>
      <div className='desc-title'>
        <span>视频简介</span>
      </div>
      <div className='video-desc'>
        <p>{video.content}</p>
      </div>
      {
        video.charge
        ? <div className='video-submit-btn'>
          <Button type='primary' onClick={paid ? '' : (e) => { boughtVideo(video) }}>
            {paid ? '您已购买' : `${video.charge}元 付费观看`}
          </Button>
        </div>
        : ''
      }
    </div>
  )
}

const reactiveMapper = ({params, context, result}, onData) => {
  const { Meteor, Collections, LocalState, wx } = context
  const { Videos } = Collections
  const { videoId } = params
  const showPayPoster = LocalState.get('showPayPoster') || false

  LocalState.set('navText', '视频详情')

  if (Meteor.subscribe('users.current').ready() && result &&
      Meteor.subscribe('videos.video', videoId).ready()) {
    const video = Videos.findOne(videoId)
    const user = Meteor.user()
    let paid = false
    if (user) {
      paid = _.indexOf(user.boughtVideos, videoId) !== -1
    }
    const shareConfig = {
      share: {
        imgUrl: video.defaultImage.url,
        title: `${video.title} - 互动科普`,
        desc: video.content.substr(0, 30),
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
    onData(null, { videoId, video, paid, showPayPoster, loading: false })
  } else {
    onData(null, { videoId, video: {}, paid: false, showPayPoster, loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  boughtVideo: actions.videos.boughtVideo
})

const wechat = ({ context, location }, onData) => {
  const { Meteor } = context

  Meteor.call('wechat.signature', window.location.href, function (error, result) {
    if (!error) {
      onData(null, { result })
    } else {
      console.log(error)
    }
  })
  onData(null, {})
}

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(wechat, { propsToWatch: [] }),
  useDeps(depsToProps)
)(VideoDetail)
