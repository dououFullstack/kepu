import React from 'react'
import TabBar from 'antd-mobile/lib/tab-bar'
import { browserHistory } from 'react-router'

const TabBarLayout = ({children}) => {
  const pathname = children.props.location.pathname

  return (
    <TabBar
      unselectedTintColor='#949494'
      tintColor='#33A3F4'
      barTintColor='white'
    >
      <TabBar.Item
        title='问答'
        key='questions'
        icon={<div className='questions-icon' />}
        selectedIcon={<div className='questions-selected-icon' />}
        selected={pathname === '/questions'}
        onPress={() => {
          browserHistory.push('/questions')
        }}
      >
        { pathname === '/questions' ? children : null }
      </TabBar.Item>
      <TabBar.Item
        title='活动'
        key='activities'
        icon={<div className='activities-icon' />}
        selectedIcon={<div className='activities-selected-icon' />}
        selected={pathname === '/activities'}
        onPress={() => {
          browserHistory.push('/activities')
        }}
      >
        { pathname === '/activities' ? children : null }
      </TabBar.Item>
      <TabBar.Item
        title=''
        key='activity-new'
        icon={<div className='activity-new-icon' />}
        selectedIcon={<div className='activity-new-selected-icon' />}
        onPress={() => {
          browserHistory.push('/questionNew')
        }}
      />
      <TabBar.Item
        title='视频'
        key='videos'
        icon={<div className='videos-icon' />}
        selectedIcon={<div className='videos-selected-icon' />}
        selected={pathname === '/videos'}
        onPress={() => {
          browserHistory.push('/videos')
        }}
      >
        { pathname === '/videos' ? children : null }
      </TabBar.Item>
      <TabBar.Item
        title='我的'
        key='mine'
        icon={<div className='mine-icon' />}
        selectedIcon={<div className='mine-selected-icon' />}
        selected={pathname === '/mine'}
        onPress={() => {
          browserHistory.push('/mine')
        }}
      >
        { pathname === '/mine' ? children : null }
      </TabBar.Item>
    </TabBar>
  )
}

export default TabBarLayout
