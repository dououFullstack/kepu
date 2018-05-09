import React from 'react'
import List from 'antd-mobile/lib/list'
import Icon from 'antd/lib/icon'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Loading from '/imports/ui/components/loading'

const { Item } = List

const InviteExpert = ({
  context,
  inviteCodes,
  showShareMenu,
  loading
}) => {
  if (loading) {
    return <Loading size='large' height='300px' />
  }
  const { LocalState } = context
  const items = inviteCodes.map((item, i) => (
    <Item
      key={item._id}
      extra={LocalState.get(`showIconId`) === item._id ? <Icon style={{ color: '#4CB44E' }} type='check-circle' /> : ''}
      onClick={(e) => { showShareMenu(e, item) }}
    >{item.code}</Item>
  ))

  return (
    <div id='user-invite-expert'>
      <List>
        { items }
      </List>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { InviteCodes } = Collections

  LocalState.set('navText', '邀请专家')

  if (Meteor.subscribe('inviteCodes.byFrontAdmin').ready()) {
    const inviteCodes = InviteCodes.find().fetch()
    onData(null, { inviteCodes, loading: false })
  } else {
    onData(null, { inviteCodes: [], loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  showShareMenu: actions.users.showShareMenu
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(InviteExpert)
