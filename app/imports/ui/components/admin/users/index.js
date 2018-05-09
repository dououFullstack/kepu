import React from 'react'
import Tabs from 'antd/lib/tabs'
import Icon from 'antd/lib/icon'

import AllUser from './allUser'
import ExpertUser from './expertUser'
import InviteCodes from './inviteCodes'

const { TabPane } = Tabs

const Users = () => {
  return (
    <div id='admin-users'>
      <Tabs defaultActiveKey='1'>
        <TabPane tab={<span><Icon type='user' />所有用户</span>} key='1'>
          <AllUser />
        </TabPane>
        <TabPane tab={<span><Icon type='android' />管理专家</span>} key='2'>
          <ExpertUser />
        </TabPane>
        <TabPane tab={<span><Icon type='barcode' />邀请码管理</span>} key='3'>
          <InviteCodes />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default Users
