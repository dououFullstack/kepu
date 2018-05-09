import React from 'react'
import WhiteSpace from 'antd-mobile/lib/white-space'
import { Link } from 'react-router'

const videoItem = ({ video }) => {
  return (
    <Link onClick={(e) => {
      window.location.href = `${window.location.origin}/videos/${video._id}`
    }}>
      <div className='video-item'>
        {/* <video src={video.defaultVideo.url} controls /> */}
        <div className='video-back'>
          <img className='video-img' src={(video.defaultImage && video.defaultImage.url) || '/images/background.png'} alt={video.title} />
          <img className='video-play' src='/images/video-2@2x.png' alt={video.title} />
        </div>
        <div className='video-info'>
          <h2 className='video-title'>{video.title}</h2>
          <span className='video-charge'>{video.charge ? `${video.charge} 元` : '免费'}</span>
          <h2 className='video-summary'>{video.content.length > 20 ? video.content.substr(0, 30) : video.content}</h2>
        </div>
      </div>
      <WhiteSpace />
    </Link>
  )
}

export default videoItem
