import React from 'react'
import { browserHistory } from 'react-router'
import SearchBar from 'antd-mobile/lib/search-bar'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import _ from 'underscore'

const Search = ({ searchText, searchSubmit, showSearchBar, placeholder }) => {
  return (
    <div style={showSearchBar ? {} : { display: 'none' }}>
      <SearchBar
        placeholder={placeholder}
        maxLength={50}
        cancelText='取消'
        onFocus={() => {
          const searchText = document.getElementsByClassName('am-search-synthetic-ph-placeholder')
          setTimeout(() => {
            searchText[0].style.visibility = 'hidden'
          }, 200)
        }}
        onBlur={() => {
          const searchText = document.getElementsByClassName('am-search-synthetic-ph-placeholder')
          setTimeout(() => {
            searchText[0].style.visibility = 'visible'
          }, 200)
        }}
        onClear={(value) => {
          searchSubmit(null)
        }}
        onSubmit={(value) => {
          searchSubmit(value)
        }} />
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  let searchText
  const { pathname } = browserHistory.getCurrentLocation()
  const showList = ['/activities', '/questions', '/videos']

  // 根据当前路由让搜索框显示不同的文字
  // if (pathname.indexOf('/activities') !== -1) {
  //   searchText = '输入活动搜索'
  // } else if (pathname.indexOf('/questions') !== -1) {
  //   searchText = '输入问题搜索'
  // } else {
  //   searchText = '搜索'
  // }

  let showSearchBar = false
  if (_.indexOf(showList, pathname) !== -1) {
    showSearchBar = true
  }

  onData(null, { searchText, showSearchBar })
}

const depsToProps = (context, actions) => ({
  context,
  searchSubmit: actions.searchBar.searchSubmit
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Search)
