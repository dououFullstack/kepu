import React from 'react'
import { browserHistory } from 'react-router'
import NavBar from 'antd-mobile/lib/nav-bar'
import Icon from 'antd/lib/icon'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

const MainNav = ({navText, showNavBar}) => {
  const pathname = browserHistory.getCurrentLocation().pathname
  const nCount = pathname.match(/\//g)
  return (
    <div className='main-navbar' style={showNavBar ? {} : { display: 'none' }}>
      <NavBar iconName={false}
        mode='light'
        leftContent={nCount.length >= 2 ? [
          <Icon
            key='0'
            type='left'
            style={{ fontSize: '16px', color: '#333' }}
            onClick={(e) => { browserHistory.goBack() }}
          />
        ] : ''}
      >{ navText }</NavBar>
      {/* <Search /> */}
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { LocalState } = context
  const showNavBar = LocalState.get('showNavBar')
  const navText = LocalState.get('navText')
  onData(null, { navText, showNavBar })
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(MainNav)
