import React from 'react'
import Input from 'antd/lib/input'
import Table from 'antd/lib/table'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import InputNumber from 'antd/lib/input-number'

import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Loading from '/imports/ui/components/loading'
import { dateToString } from '/imports/lib/helpers'

const { Search } = Input
const { Column } = Table
const { Item } = Form

const AdminInviteCodes = ({ context, loading, form, inviteCodes, createInviteCode }) => {
  const { getFieldDecorator } = form
  const dataSource = []
  if (!loading && inviteCodes) {
    inviteCodes.map((inviteCode, i) => {
      dataSource.push({
        key: inviteCode._id,
        code: inviteCode.code,
        status: inviteCode.status,
        usedUser: inviteCode.usedUserName,
        createdAt: dateToString(inviteCode.createdAt)
      })
    })
  } else {
    return <Loading size='large' height='300px' />
  }

  return (
    <div className='admin-invite-code'>
      <div className='code-header'>
        <Form layout='inline' onSubmit={(e) => { createInviteCode(e, form) }} style={{float: 'left'}}>
          <Item>
            生成&nbsp;&nbsp;
            {getFieldDecorator('count', {
              initialValue: 1
            })(<InputNumber
              min={1}
              max={100}
            />)}
            个
          </Item>
          <Item>
            <Button type='primary' htmlType='submit'>生成邀请码</Button>
          </Item>
        </Form>
        <Search
          placeholder=''
          style={{ width: 200, float: 'right' }}
          onSearch={value => console.log(value)}
        />
      </div>
      <WhiteSpace />
      <Table dataSource={dataSource}>
        <Column
          title='邀请码'
          dataIndex='code'
          key='code'
        />
        <Column
          title='使用状态'
          dataIndex='status'
          key='status'
          render={(status, record) => {
            return status ? '已使用' : '未使用'
          }}
        />
        <Column
          title='使用者'
          dataIndex='usedUser'
          key='usedUser'
          render={(usedUser, record) => (usedUser || '未使用')}
        />
        <Column
          title='创建时间'
          dataIndex='createdAt'
          key='createdAt'
        />
        <Column
          title='操作'
          key='action'
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor, Collections } = context
  const { InviteCodes } = Collections
  if (Meteor.subscribe('inviteCodes.all').ready()) {
    const inviteCodes = InviteCodes.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
    onData(null, { inviteCodes })
  } else {
    onData(null, {})
  }
}

const depsToProps = (context, actions) => ({
  context,
  createInviteCode: actions.admin.createInviteCode
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Form.create({})(AdminInviteCodes))
