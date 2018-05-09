import React from 'react'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import Card from 'antd/lib/card'
import Table from 'antd/lib/table'
import WhiteSpace from 'antd-mobile/lib/white-space'
import { CSVLink } from 'react-csv'

import { dateToString } from '/imports/lib/helpers'

const { Column } = Table

const AdminEnrollments = ({activity, enrollments}) => {
  const dataSource = []
  const exportData = []
  let strAttachments = ''
  enrollments.map((d, i) => {
    dataSource.push({
      key: d._id,
      name: d.username,
      gender: d.gender,
      cardtype: d.IDCardType,
      cardnumber: d.IDCardNumber,
      telephone: d.telephone,
      email: d.email,
      attachments: d.attachments,
      createdAt: dateToString(d.createdAt)
    })
    if (Array.isArray(d.attachments)) {
      d.attachments.map((attachment, i) => {
        strAttachments += `${attachment.name}：${attachment.url}`
        if (i + 1 !== d.attachments.length) {
          strAttachments += `\r`
        }
      })
    }

    exportData.push({
      '报名ID': d._id,
      '活动ID': d.activityId,
      '用户ID': d.userId,
      '用户姓名': d.username,
      '性别': d.gender,
      '证件类型': d.IDCardType,
      '证件号': `'${d.IDCardNumber}'`,
      '联系电话': d.telephone,
      '联系邮箱': d.email,
      '报名时间': dateToString(d.createdAt),
      '附件': `${strAttachments}`
    })
  })

  return (
    <div id='admin-enrollments'>
      <Card className='activity-card'>
        <div className='activity-content'>
          <img className='activity-img' src={activity.defaultImage && activity.defaultImage.url} alt='' />
          <div className='activity-info'>
            <h2 className='activity-title'>{activity.title}</h2>
            <span className='enroll-count'>报名人数：( {enrollments.length} )</span>
            <CSVLink
              data={exportData}
              filename='报名列表.csv'
            >
              导出报名列表
            </CSVLink>
            <span className='activity-end-time'>
              结束时间：{dateToString(activity.endTime)}
            </span>
          </div>
        </div>
      </Card>
      <WhiteSpace />
      <Table dataSource={dataSource}>
        <Column
          title='姓名'
          dataIndex='name'
          key='name'
        />
        <Column
          title='性别'
          dataIndex='gender'
          key='gender'
        />
        <Column
          title='证件类型'
          dataIndex='cardtype'
          key='cardtype'
        />
        <Column
          title='证件号'
          dataIndex='cardnumber'
          key='cardnumber'
        />
        <Column
          title='手机号'
          dataIndex='telephone'
          key='telephone'
        />
        <Column
          title='邮箱'
          dataIndex='email'
          key='email'
        />
        <Column
          title='附件'
          dataIndex='attachments'
          key='attachments'
          render={(attachments, record) => {
            // console.log(attachments)
            return Array.isArray(attachments) ? attachments.map(attachment => (
              <p key={attachment.key}>
                <a
                  href={`blob:${attachment.url}`}
                  download={attachment.name}
                >
                  {attachment.name}
                </a>
              </p>
            )) : ''
            // if (attachment && attachment.url) {
            //   return <a href={attachment.url} target='_blank'>{attachment.name}</a>
            // } else {
            //   return '无'
            // }
          }}
        />
        <Column
          title='报名时间'
          dataIndex='createdAt'
          key='createdAt'
        />
      </Table>
    </div>
  )
}

const reactiveMapper = ({params, context}, onData) => {
  const { Meteor, Collections } = context
  const { Activities, Enrollments } = Collections
  if (Meteor.subscribe('activities.activity', params.id).ready() &&
      Meteor.subscribe('enrollments.activity', params.id).ready()) {
    const activity = Activities.findOne(params.id)
    const enrollments = Enrollments.find({activityId: params.id}).fetch()
    onData(null, { activity, enrollments })
  }
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(AdminEnrollments)