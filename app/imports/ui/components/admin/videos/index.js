import React from 'react'
import { browserHistory, Link } from 'react-router'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Table from 'antd/lib/table'
import Popconfirm from 'antd/lib/popconfirm'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import { dateToString } from '/imports/lib/helpers'
// import Loading from '/imports/ui/components/loading'

const { Search } = Input
const { Column } = Table

const AdminVideos = ({ context, videos, loading, deleteVideo, setVisible, searchSubmit, resetSearch, searchTerm, videoCount, currentPage }) => {
  const { LocalState } = context

  // if (loading) {
  //   return <Loading size='large' height='300px' />
  // }

  const dataSource = []
  videos.map((d, i) => {
    dataSource.push({
      key: d._id,
      title: d.title,
      viewCount: d.viewCount || 0,
      defaultImage: d.defaultImage,
      defaultVideo: d.defaultVideo,
      charge: d.charge,
      createdAt: dateToString(d.createdAt),
      isVisible: d.isVisible
    })
  })

  const pagination = {
    total: videoCount,
    current: currentPage,
    onChange: (page, pageSize) => {
      LocalState.set('currentVideoPage', page)
    }
  }

  return (
    <div id='admin-videos'>
      <div className='videos-header'>
        <Button type='primary' icon='plus' size='large'
          onClick={(e) => {
            browserHistory.push('/admin/videoNew')
          }}
        >
          添加视频
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
          title='视频标题'
          dataIndex='title'
          key='title'
          render={(text, record) => (
            <div className='title-header'>
              <img src={record.defaultImage.url} className='title-video' alt={record.title} />
              <div className='title-content'>
                {text}
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
          title='费用'
          dataIndex='charge'
          key='charge'
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
              <Link style={record.isVisible ? { color: '#EE6671' } : {}}
                onClick={(e) => { setVisible(record.key, !record.isVisible) }}>
                {record.isVisible ? '下线' : '上线'}
              </Link>
              <span className='ant-divider' />
              <Link to={`/admin/videoEdit/${record.key}`}>编辑</Link>
              <span className='ant-divider' />
              <Popconfirm title='你确定要删除这个视频吗？' onConfirm={(e) => { deleteVideo(e, record.key) }} okText='是' cancelText='否'>
                <Link style={{color: '#F04134'}}>删除</Link>
              </Popconfirm>
            </span>
          )}
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context, videoCount}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Videos } = Collections
  const pageSize = 10
  const currentPage = LocalState.get('currentVideoPage') || 1
  const searchTerm = LocalState.get('searchTerm')

  LocalState.set('defaultVideo', '')
  LocalState.set('defaultImage', '')
  LocalState.set('showChargeInput', null)

  if (Meteor.subscribe('videos.pagination', currentPage, searchTerm).ready() && videoCount !== null) {
    let query = {}
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i')
      query = { $or: [ { title: regex } ] }
    }
    const videos = Videos.find(query, {
      sort: { createdAt: -1 },
      skip: pageSize * (currentPage - 1),
      limit: pageSize
    }).fetch()
    onData(null, { videos, searchTerm, currentPage, loading: false })
  } else {
    onData(null, { videos: [], searchTerm: null, loading: true })
  }
}

const videoCount = ({ context }, onData) => {
  const { Meteor, LocalState } = context
  const searchTerm = LocalState.get('searchTerm')

  Meteor.call('videos.count', searchTerm, (err, res) => {
    if (!err) {
      onData(null, { videoCount: res })
    }
  })

  onData(null, { videoCount: null })
}

const depsToProps = (context, actions) => ({
  context,
  deleteVideo: actions.admin.deleteVideo,
  setVisible: actions.admin.setVisible,
  searchSubmit: actions.admin.searchSubmit,
  resetSearch: actions.admin.resetSearch
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(getTrackerLoader(videoCount)),
  useDeps(depsToProps)
)(AdminVideos)
