import React from 'react'
import { Link, browserHistory } from 'react-router'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Popconfirm from 'antd/lib/popconfirm'

import DateToString from '/imports/lib/dateToString'
import getTrackerLoader from '/imports/api/getTrackerLoader'
// import Loading from '/imports/ui/components/loading'

const { Column } = Table
const { Search } = Input

const AdminActivities = ({
  context,
  activities,
  deleteActivity,
  searchSubmit,
  searchTerm,
  resetSearch,
  activityCount,
  currentPage,
  loading
}) => {
  const { LocalState } = context

  // if (loading) {
  //   return <Loading size='large' height='300px' />
  // }

  const dataSource = []
  activities.map((d, i) => {
    dataSource.push({
      key: d._id,
      title: d.title,
      viewCount: d.viewCount || 0,
      defaultImage: d.defaultImage,
      endTime: DateToString(d.endTime),
      charge: d.charge,
      refund: d.refund,
      telephone: d.telephone,
      createdAt: DateToString(d.createdAt),
      enrollmentCount: 100
    })
  })

  const pagination = {
    total: activityCount,
    current: currentPage,
    onChange: (page, pageSize) => {
      LocalState.set('currentActivityPage', page)
    }
  }

  return (
    <div id='admin-activities'>
      <div className='activities-header'>
        <Button type='primary' icon='plus' size='large'
          onClick={(e) => {
            browserHistory.push('/admin/activityNew')
          }}
        >
          新建活动
        </Button>
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
      <Table dataSource={dataSource} pagination={pagination} loading={loading}>
        <Column
          title='活动标题'
          dataIndex='title'
          key='title'
          render={(text, record) => (
            <div className='title-header'>
              <img src={record.defaultImage && record.defaultImage.url} className='title-img' alt={record.title} />
              <div className='title-content'>
                <Link to={`/admin/enrollments/${record.key}`}>{text && text.length > 30 ? text.slice(0, 30) + '...' : text}</Link>
                <span className='activity-end-time'>
                  截止时间：{DateToString(record.endTime)}
                </span>
              </div>
            </div>
          )}
        />
        <Column
          title='浏览量'
          dataIndex='viewCount'
          key='viewCount'
        />
        <Column
          title='报名费用'
          dataIndex='charge'
          key='charge'
        />
        <Column
          title='可否退款'
          dataIndex='refund'
          key='refund'
          render={(text, record) => {
            return text ? '可以' : '不可以'
          }}
        />
        <Column
          title='主办方电话'
          dataIndex='telephone'
          key='telephone'
        />
        <Column
          title='创建时间'
          dataIndex='createdAt'
          key='createdAt'
        />
        <Column
          title='操作'
          key='action'
          render={(text, record) => (
            <span>
              <Link to={`/admin/enrollments/${record.key}`}>查看报名</Link>
              <span className='ant-divider' />
              <Link to={`/admin/activityEdit/${record.key}`}>编辑</Link>
              <span className='ant-divider' />
              <Popconfirm title='你确定要删除这个活动吗？' onConfirm={(e) => { deleteActivity(e, record.key) }} okText='是' cancelText='否'>
                <Link style={{color: '#F04134'}}>删除</Link>
              </Popconfirm>
            </span>
          )}
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context, activityCount}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Activities } = Collections
  const pageSize = 10
  const currentPage = LocalState.get('currentActivityPage') || 1
  const searchTerm = LocalState.get('searchTerm')

  LocalState.set('defaultImage', null)
  LocalState.set('attachments', null)

  if (Meteor.subscribe('activities.pagination', currentPage, searchTerm).ready() && activityCount !== null) {
    const activities = Activities.find({}, {
      sort: { createdAt: -1 },
      skip: pageSize * (currentPage - 1),
      limit: pageSize
    }).fetch()
    onData(null, { activities, searchTerm, currentPage, activityCount, loading: false })
  } else {
    onData(null, { activities: [], searchTerm: null, loading: true })
  }
}

const activityCount = ({ context }, onData) => {
  const { Meteor } = context
  Meteor.call('activities.count', (err, res) => {
    if (!err) {
      onData(null, { activityCount: res })
    }
  })
  onData(null, { activityCount: null })
}

const depsToProps = (context, actions) => ({
  context,
  deleteActivity: actions.admin.deleteActivity,
  searchSubmit: actions.admin.searchSubmit,
  resetSearch: actions.admin.resetSearch
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(activityCount),
  useDeps(depsToProps)
)(AdminActivities)
