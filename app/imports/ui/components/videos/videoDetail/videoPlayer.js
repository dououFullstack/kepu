import React from 'react'
import videojs from 'video.js'
import { browserHistory } from 'react-router'
import Toast from 'antd-mobile/lib/toast'

export default class VideoPlayer extends React.Component {
  componentDidMount () {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady () {
      // console.log('onPlayerReady', this)
    })
    const seconds = this.props.seconds
    const paid = this.props.paid
    const videoId = this.props.videoId
    if (seconds > 0) {
      this.timer = setInterval(() => {
        const currentTime = this.player.currentTime()
        if (currentTime > seconds) {
          this.player.exitFullscreen()
          // this.player.error(`此视频为付费视频，您只能观看 ${seconds} 秒，继续播放此视频需要购买`)
          Toast.fail(`此视频为付费视频，您只能观看 ${seconds} 秒，继续播放此视频需要购买`, 4)
          clearInterval(this.timer)
          this.player.dispose()
        }
      }, 200)
    } else if (seconds === 0 && !paid) {
      setTimeout(() => {
        this.player.exitFullscreen()
        // this.player.error('继续播放此视频需要购买')
        Toast.fail(`继续播放此视频需要购买`, 4)
        this.player.dispose()
      }, 500)
    }
  }

  componentDidUpdate (provProps, provState) {
    if (this.props.paid && this.props.paid !== provProps.paid) {
      this.player.error(null)
    }
  }

  // destroy player on unmount
  componentWillUnmount () {
    this.player && this.player.dispose()
    this.timer && clearInterval(this.timer)
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render () {
    return (
      <div data-vjs-player>
        <video ref={node => { this.videoNode = node }} className='video-js' />
      </div>
    )
  }
}
