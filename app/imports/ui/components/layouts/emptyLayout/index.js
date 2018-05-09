import React from 'react'
import Layout from 'antd/lib/layout'

const { Content } = Layout

const EmptyLayout = (props) => {
  return (
    <Layout id='empty-layout'>
      <Content style={{ padding: '0 50px', height: '100%' }}>
        {props.children}
      </Content>
    </Layout>
  )
}

export default EmptyLayout
