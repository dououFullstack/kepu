import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import Router from './routes'

import 'video.js/dist/video-js.css'

Meteor.startup(() => {
  render(
    <Router />,
    document.getElementById('render-target')
  )
})
