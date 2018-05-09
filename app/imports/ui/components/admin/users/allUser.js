import React from 'react'
import { Link } from 'react-router'
import Input from 'antd/lib/input'
import Table from 'antd/lib/table'
import WhiteSpace from 'antd-mobile/lib/white-space'

import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Loading from '/imports/ui/components/loading'

const { Search } = Input
const { Column } = Table

const AllUser = ({users, loading, context, setWorkState, banUser, searchSubmit, resetSearch, searchTerm, userCount, currentPage, setUserRoles}) => {
  const { UserRoles, LocalState } = context
  const { ADMIN, EXPERT, USER, FRONTADMIN, hasPermission } = UserRoles
  const dataSource = []
  if (!loading) {
    users.map((user, i) => {
      dataSource.push({
        key: user._id,
        username: user.username,
        nickname: user.profile.nickname,
        sex: user.profile.sex,
        usergroup: user.roles,
        isWorking: user.isWorking,
        isBan: user.isBan
      })
    })
  } else {
    return <Loading size='large' height='300px' />
  }

  const pagination = {
    total: userCount,
    current: currentPage,
    onChange: (page, pageSize) => {
      LocalState.set('currentPage', page)
    }
  }

  return (
    <div className='all-user'>
      <div className='users-header'>
        <div className='search-input'>
          { searchTerm ? <Link className='showAll' onClick={(e) => {
            resetSearch()
          }}>显示全部</Link> : '' }
          <Search
            placeholder='输入你要搜索的内容'
            defaultValue={searchTerm}
            onSearch={value => searchSubmit(value)}
          />
        </div>
      </div>
      <WhiteSpace />
      <Table dataSource={dataSource} pagination={pagination}>
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
              <Link onClick={(e) => { banUser(record.key, !record.isBan) }} style={record.isBan ? { color: '#EE6671' } : {}}>
                {record.isBan ? '取消禁言' : '禁言'}
              </Link>
              <span className='ant-divider' />
              <Link onClick={() => { setUserRoles(record.key, hasPermission(EXPERT, record.usergroup), EXPERT) }} style={hasPermission(EXPERT, record.usergroup) ? { color: '#EE6671' } : {}}>
                { !hasPermission(EXPERT, record.usergroup) ? '提升为专家' : '取消专家' }
              </Link>
              <span className='ant-divider' />
              <Link onClick={() => { setUserRoles(record.key, hasPermission(FRONTADMIN, record.usergroup), FRONTADMIN) }} style={hasPermission(FRONTADMIN, record.usergroup) ? { color: '#EE6671' } : {}}>
                { !hasPermission(FRONTADMIN, record.usergroup) ? '提升为前台管理' : '取消前台管理' }
              </Link>
            </span>
          )}
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context, userCount}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Users } = Collections
  const pageSize = 10
  const userRole = 'user'
  const currentPage = LocalState.get('currentPage') || 1
  const searchTerm = LocalState.get('searchTerm')

  if (Meteor.subscribe('users.pagination', currentPage, userRole, searchTerm).ready() && userCount !== null) {
    let query = {}
    const skip = { skip: pageSize * (currentPage - 1), limit: pageSize }
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')
      query = {
        $or: [
          { username: regex },
          { 'profile.nickname': regex }
        ]
      }
    }
    const users = Users.find(query, skip).fetch()
    onData(null, { users, searchTerm, currentPage, loading: false })
  } else {
    onData(null, { users: {}, searchTerm: null, currentPage, loading: true })
  }
}

const dataCount = ({context}, onData) => {
  const { Meteor, LocalState } = context
  const searchTerm = LocalState.get('searchTerm')

  Meteor.call('users.count', searchTerm, (error, result) => {
    if (!error) {
      onData(null, { userCount: result })
    }
  })

  onData(null, { userCount: null })
}

const depsToProps = (context, actions) => ({
  context,
  banUser: actions.admin.banUser,
  searchSubmit: actions.admin.searchSubmit,
  resetSearch: actions.admin.resetSearch,
  setUserRoles: actions.admin.setUserRoles
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(getTrackerLoader(dataCount)),
  useDeps(depsToProps)
)(AllUser)
