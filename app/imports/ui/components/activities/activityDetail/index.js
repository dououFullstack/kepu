import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router'
import _ from 'underscore'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import { dateToString, dateToString2, openDownloadDialog } from '/imports/lib/helpers'

const Warpper = styled.div`
  background-color: #f6f6f6;
`

const Img = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`

const MainSection = styled.section`
  padding: 15px 12px;
  background-color: #FFFFFF;
`

const Title = styled.h1`
  font-size: 18px;
  color: #333;
  line-height: 25px;
  margin-top: 0;
  margin-bottom: 19px;
`

const PriceWarp = styled.div`
  font-size: 13px;
  margin-bottom: 12px;
`

const Icon = styled.img`
  height: 16px;
  width: 16px;
  margin-bottom: -3px;
  margin-right: 2px;
`

const Highlight = styled.span`
  color: #589aff
`

const Location = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
`

const Deadline = styled.div`
  font-size: 13px;
  color: #666;
`

const SbuTitle = styled.div`
  font-size: 14px;
  color: #333;
  line-height: 12px;
  height: 35px;
  padding: 12px;
`

const Desc = styled.div`
  font-size: 12px;
  padding: 12px 12px 16px 12px;
  background-color: #FFFFFF;
`

const Enroll = styled.div`
  border-top: 1px solid #e5e5e5;
  height: 56px;
  background-color: #fafafa;
  margin-top: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Button = styled.div`
  background-color: #007aff;
  font-size: 16px;
  color: #fff;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  line-height: 35px;
  height: 36px;
`

const ActivityDetail = ({activity, showEnrollBtn, enroll, hasExpired}) => {
  const attachments = activity.attachments.map((attachment, i) => (
    <p key={attachment.uid}>
      <span>{i + 1}. </span>
      <a
        // href={`blob:${attachment.url}`}
        href={attachment.url}
        target='_blank'
        className='activity-attachment'
        download={attachment.name}
      >
        {attachment.name}
      </a>
    </p>
  ))

  return (
    <Warpper>
      <Img src={activity.defaultImage && activity.defaultImage.url} />

      <MainSection>
        <Title>
          {activity.title}
        </Title>
        <PriceWarp>
          <Icon src='/images/money@2x.png' />费用：
          <Highlight>{activity.charge ? `${activity.charge}元` : '免费'}</Highlight>
        </PriceWarp>
        <Location>
          <Icon src='/images/place@2x.png' />地址：{activity.address}
        </Location>
        <Deadline>
          <Icon src='/images/time@2x.png' />活动报名截止日期: {dateToString2(activity.endTime)}
        </Deadline>
      </MainSection>

      <SbuTitle>活动信息</SbuTitle>

      <Desc>
        {activity.content}
      </Desc>

      <SbuTitle>注意事项</SbuTitle>

      <Desc>
        {activity.notice}
      </Desc>

      <SbuTitle>附件详情</SbuTitle>

      <Desc>
        {attachments}
      </Desc>

      <Enroll>
        {
          showEnrollBtn
          ? <Button
            disabled={hasExpired}
            onClick={hasExpired ? null : (e) => { enroll(e, activity._id) }}
            style={hasExpired ? { backgroundColor: '#ccc' } : {}}
          >
            { hasExpired ? '活动已经结束' : '立刻报名' }
          </Button>
          : <Button>您已报名</Button>
        }
      </Enroll>
    </Warpper>
  )
}

const reactiveMapper = ({params, context, result}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Activities } = Collections
  LocalState.set('navText', '活动详情')
  if (Meteor.subscribe('users.current').ready() &&
      Meteor.subscribe('activities.activity', params.id).ready()) {
    const activity = Activities.findOne(params.id)
    // 判断用户是否已经报名
    const user = Meteor.user()
    let showEnrollBtn = true
    if (user) {
      showEnrollBtn = _.indexOf(user.boughtActivities, activity._id) === -1
    }
    // 判断活动是否已经过期
    const now = new Date()
    const activityEndDate = new Date(activity.endTime.setHours(23, 59, 59, 0))
    const hasExpired = now.getTime() > activityEndDate.getTime()

    onData(null, { activity, showEnrollBtn, hasExpired })
  }
}

const wechat = ({ context }, onData) => {
  const { Meteor } = context
  Meteor.call('wechat.signature', window.location.href, (error, result) => {
    if (!error) onData(null, { result })
  })
  onData(null, {})
}

const depsToProps = (context, actions) => ({
  context,
  enroll: actions.activities.enroll
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(wechat, { propsToWatch: [] }),
  useDeps(depsToProps)
)(ActivityDetail)
