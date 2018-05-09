import React from 'react'
import { Link } from 'react-router'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Modal from 'antd/lib/modal'

import DateToString from '/imports/lib/dateToString'
import getTrackerLoader from '/imports/api/getTrackerLoader'
// import Loading from '/imports/ui/components/loading'

const { Column } = Table
const { Search } = Input
const { confirm } = Modal

const AdminQuestions = ({context, questions, selectedRowKeys, deleteQuestions, quesetionSelectChange, setQuestionVisible, searchSubmit, resetSearch, searchTerm, questionCount, currentPage, loading}) => {
  const { LocalState } = context

  // if (loading) {
  //   return <Loading size='large' height='300px' />
  // }

  const dataSource = []
  questions.map((d, i) => {
    dataSource.push({
      key: d._id,
      title: d.title,
      viewCount: d.viewCount || 0,
      answerTotal: d.answerTotal,
      defaultImage: d.defaultImage,
      endTime: DateToString(d.endTime),
      charge: d.charge,
      refund: d.refund,
      telephone: d.telephone,
      isVisible: d.isVisible,
      showTime: d.showTime,
      createdAt: DateToString(d.createdAt),
      enrollmentCount: 100
    })
  })

  const showDeleteConfirm = () => {
    confirm({
      title: '删除问题',
      content: '你确定要删除这些问题吗？',
      okText: '是的',
      okType: 'danger',
      cancelText: '取消',
      onOk () {
        deleteQuestions(selectedRowKeys)
      },
      onCancel () {
      }
    })
  }

  const pagination = {
    total: questionCount,
    current: currentPage,
    onChange: (page, pageSize) => {
      LocalState.set('currentQuestionPage', page)
    }
  }

  return (
    <div id='admin-questions'>
      <div className='questions-header'>
        <Button
          type='primary'
          disabled={!selectedRowKeys.length}
          onClick={showDeleteConfirm}
        >
          删除问题
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
      <Table
        rowSelection={{onChange: quesetionSelectChange}}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading}
      >
        <Column
          title='问题标题'
          dataIndex='title'
          key='title'
        />
        <Column
          title='浏览量'
          dataIndex='viewCount'
          key='viewCount'
        />
        <Column
          title='回答'
          dataIndex='answerTotal'
          key='answerTotal'
          render={(t, r) => (
            <Link to={`/admin/answers/${r.key}`}>{t}</Link>
          )}
        />
        <Column
          title='自动公开时间'
          dataIndex='showTime'
          key='showTime'
          render={(showTime, record) => (
            DateToString(showTime)
          )}
        />
        <Column
          title='创建时间'
          dataIndex='createdAt'
          key='createdAt'
        />
        <Column
          title='操作'
          key='action'
          render={(text, record) => {
            let isVisible = false
            if (record.isVisible === undefined) {
              const nowTime = new Date()
              const showTime = record.showTime
              nowTime.getTime() > showTime.getTime() ? isVisible = true : isVisible = false
            } else {
              isVisible = record.isVisible
            }
            return <span>
              <Link
                style={isVisible ? { color: '#F04134' } : {}}
                onClick={(e) => {
                  setQuestionVisible(record.key, !isVisible)
                }}>{isVisible ? '禁止' : '公开'}</Link>
            </span>
          }}
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({context, questionCount}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Questions } = Collections
  const pageSize = 10
  const currentPage = LocalState.get('currentQuestionPage') || 1
  const selectedRowKeys = LocalState.get('selectedRowKeys') || []
  const searchTerm = LocalState.get('searchTerm')

  if (Meteor.subscribe('questions.pagination', currentPage, searchTerm).ready() && questionCount !== null) {
    const questions = Questions.find({}, {
      sort: { createdAt: -1 },
      skip: pageSize * (currentPage - 1),
      limit: pageSize
    }).fetch()
    onData(null, { questions, selectedRowKeys, searchTerm, currentPage, loading: false })
  } else {
    onData(null, { questions: [], selectedRowKeys: [], searchTerm: null, loading: true })
  }
}

const dataCount = ({ context }, onData) => {
  const { Meteor } = context
  Meteor.call('questions.count', (err, res) => {
    if (!err) {
      onData(null, { questionCount: res })
    }
  })
  onData(null, { questionCount: null })
}

const depsToProps = (context, actions) => ({
  context,
  deleteQuestions: actions.admin.deleteQuestions,
  quesetionSelectChange: actions.admin.quesetionSelectChange,
  setQuestionVisible: actions.admin.setQuestionVisible,
  searchSubmit: actions.admin.searchSubmit,
  resetSearch: actions.admin.resetSearch
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(dataCount),
  useDeps(depsToProps)
)(AdminQuestions)
