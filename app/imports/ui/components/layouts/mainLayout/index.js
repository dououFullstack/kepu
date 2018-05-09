import React from 'react'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import MainNav from './mainNav'
import MainTabBar from './mainTabBar'

const MainLayout = ({children}) => (
  <div id='main-layout'>
    <MainNav />
    {
      children.props.location.pathname === '/questions' ||
      children.props.location.pathname === '/activities' ||
      children.props.location.pathname === '/videos' ||
      children.props.location.pathname === '/mine'
      ? <MainTabBar children={children} />
      : children
    }
  </div>
)

const reactiveMapper = ({ context }, onData) => {
  const { LocalState } = context
  if (!document.getElementsByName('viewport')[0].content) {
    document.getElementsByName('viewport')[0].content = 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0'
  }

  LocalState.set('showNavBar', true)
  onData(null, {})
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(MainLayout)
