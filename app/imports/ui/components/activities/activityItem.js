import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router'

import { dateToString2 } from '/imports/lib/helpers'

const Wrapper = styled.div`
  display: table;
  padding: 12px;
  border-bottom: 1px solid #f6f6f6;
  overflow: auto;
  background-color: #FFF;
`

const Img = styled.img`
  display: table-cell;
  width: 120px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
`

const Content = styled.div`
  width: 100%;
  position: relative;
  display: table-cell;
  vertical-align: top;
  padding: 6px 0 6px 9px;
`

const Title = styled.h1`
  position: relative;
  overflow: hidden;
  height: 32px;
  font-size: 14px;
  line-height: 16px;
  color: #333;
  margin-top: 0;
  margin-bottom: 6px;
`

const Location = styled.h2`
  font-size: 13px;
  line-height: 13px;
  color: #999;
`

const Time = styled.h2`
  position: absolute;
  bottom: 6px;
  text-align: inherit;
  font-size: 13px;
  line-height: 13px;
  color: #999;
`

const PriceWrap = styled.h2`
  font-size: 16px;
  line-height: 16px;
  color: #007aff;
  position: absolute;
  right: 0;
  bottom: 6px;
`

const ActivityItem = ({activity}) => {
  return (
    <Link to={`/activities/${activity._id}`}>
      <Wrapper className='activity-item'>
        <Img src={activity.defaultImage && activity.defaultImage.url} />
        <Content>
          <Title>
            {activity.title && activity.title.length > 30 ? activity.title.slice(0, 30) + '...' : activity.title}
          </Title>
          <Location>
            {activity.address}
          </Location>
          <Time>
            {dateToString2(activity.endTime)}
          </Time>
          <PriceWrap>
            {activity.charge ? '¥' + activity.charge : '免费'}
          </PriceWrap>
        </Content>
      </Wrapper>
    </Link>
  )
}

export default ActivityItem
