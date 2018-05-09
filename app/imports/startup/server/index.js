import { Meteor } from 'meteor/meteor'
import context from './context'
import initAPIs from './initAPIs'
import fixtures from './fixtures'

Meteor.startup(() => {
  if (Meteor.isProduction) WebAppInternals.setBundledJsCssPrefix('https://kepu.douhs.com')
  initAPIs(context)
  fixtures(context)
})
