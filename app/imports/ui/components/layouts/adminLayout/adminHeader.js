import React from 'react'
import Layout from 'antd/lib/layout'
import Menu from 'antd/lib/menu'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

const { Header } = Layout

const AdminHeader = ({pathname, currentUser, linkTo}) => {
  return (
    <Header>
      <div className='logo' />
      <Menu
        theme='dark'
        mode='horizontal'
        defaultSelectedKeys={['activities']}
        selectedKeys={[pathname]}
        style={{ lineHeight: '64px' }}
        onClick={linkTo}
      >
        <Menu.Item key='/admin/home'>全局设置</Menu.Item>
        <Menu.Item key='/admin/activities'>活动管理</Menu.Item>
        <Menu.Item key='/admin/questions'>问题管理</Menu.Item>
        <Menu.Item key='/admin/videos'>视频管理</Menu.Item>
        <Menu.Item key='/admin/transactions'>交易管理</Menu.Item>
        <Menu.Item key='/admin/users'>用户管理</Menu.Item>
        <Menu.Item key='logout' style={{ float: 'right' }}>({currentUser.profile.nickname}) 退出登录</Menu.Item>
      </Menu>
    </Header>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor } = context
  const currentUser = Meteor.user()
  onData(null, { currentUser })
}

const depsToProps = (context, actions) => ({
  context,
  linkTo: actions.admin.linkTo
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(AdminHeader)
