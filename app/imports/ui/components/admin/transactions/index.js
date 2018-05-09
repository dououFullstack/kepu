import React from 'react'
import Tabs from 'antd/lib/tabs'
import Icon from 'antd/lib/icon'

import AllTransaction from './allTransaction'
import RefundMgr from './refund'

const { TabPane } = Tabs

const AdminTransactions = () => {
  return (
    <div id='admin-transactions'>
      <Tabs defaultActiveKey='1'>
        <TabPane tab={<span><Icon type='pay-circle-o' />所有交易</span>} key='1'>
          <AllTransaction />
        </TabPane>
        <TabPane tab={<span><Icon type='rollback' />退款申请</span>} key='2'>
          <RefundMgr />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default AdminTransactions
