import React from 'react'
import Layout from 'antd/lib/layout'
import Breadcrumb from 'antd/lib/breadcrumb'
import { browserHistory } from 'react-router'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import AdminHeader from './adminHeader'
import AdminFooter from './adminFooter'

const { Content } = Layout

const AdminLayout = (props) => {
  const { routes, params, children } = props
  return (
    <Layout id='admin-layout'>
      <AdminHeader pathname={props.location.pathname} />
      <Content style={{ padding: '0 50px' }}>
        <Breadcrumb
          routes={routes}
          params={params}
          separator='>'
          style={{ margin: '12px 0' }}
        />
        <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
          {children || 'Home Page'}
        </div>
      </Content>
      <AdminFooter />
    </Layout>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor, Roles, UserRoles } = context
  if (document.getElementsByName('viewport')[0].content) {
    document.getElementsByName('viewport')[0].content = ''
  }
  if (Meteor.subscribe('users.current').ready()) {
    // 如果登录用户没有管理权限，那么跳转到登录页面
    if (!Meteor.user() || (Meteor.user() && !Roles.userIsInRole(Meteor.userId(), UserRoles.ADMIN))) {
      browserHistory.push('/login')
    } else {
      onData(null, {})
    }
  }
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(AdminLayout)
