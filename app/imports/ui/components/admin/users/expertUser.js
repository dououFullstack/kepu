import React from 'react'
import { Link } from 'react-router'
import Table from 'antd/lib/table'
import WhiteSpace from 'antd-mobile/lib/white-space'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Loading from '/imports/ui/components/loading'

const { Column } = Table

const ExpertUser = ({
  context,
  experts,
  setWorkState,
  loading
}) => {
  const { UserRoles } = context
  const { ADMIN, EXPERT, USER, hasPermission } = UserRoles
  const dataSource = []

  if (!loading) {
    experts.map((expert, i) => {
      dataSource.push({
        key: expert._id,
        username: expert.username,
        nickname: expert.profile.nickname,
        sex: expert.profile.sex,
        usergroup: expert.roles,
        isWorking: expert.isWorking
      })
    })
  } else {
    return <Loading size='large' height='300px' />
  }

  return (
    <div className='expert-user'>
      <div className='users-header'>
        <div className='search-input'>
          {/*  */}
        </div>
      </div>
      <WhiteSpace />
      <Table dataSource={dataSource}>
        <Column
          title='用户名（手机号）'
          dataIndex='username'
          key='username'
        />
        <Column
          title='微信昵称'
          dataIndex='nickname'
          key='nickname'
        />
        <Column
          title='性别'
          dataIndex='sex'
          key='sex'
          render={(sex) => (
            sex ? '男' : '女'
          )}
        />
        <Column
          title='用户组'
          dataIndex='usergroup'
          key='usergroup'
          render={(roles) => {
            let userRoles = ''
            if (hasPermission(ADMIN, roles)) userRoles += '管理员 '
            if (hasPermission(EXPERT, roles)) userRoles += '特邀专家 '
            if (hasPermission(USER, roles)) userRoles += '普通用户 '
            return userRoles
          }}
        />
        <Column
          title='操作'
          key='action'
          render={(text, record) => (
            <span>
              {hasPermission(EXPERT, record.usergroup) && !record.isWorking ? <Link onClick={(e) => { setWorkState(record.key, true) }}>设置轮值</Link> : ''}
              {hasPermission(EXPERT, record.usergroup) && record.isWorking ? <Link style={{ color: '#EE6671' }} onClick={(e) => { setWorkState(record.key, false) }}>取消轮值</Link> : ''}
            </span>
          )}
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor, Collections } = context
  const { Users } = Collections
  if (Meteor.subscribe('users.experts').ready()) {
    const experts = Users.find({
      roles: { $elemMatch: { $in: ['expert'] } }
    }).fetch()
    onData(null, { experts, loading: false })
  } else {
    onData(null, { loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  setWorkState: actions.admin.setWorkState
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(ExpertUser)
