import { browserHistory } from 'react-router'
import Toast from 'antd-mobile/lib/toast'

export default {
  enroll ({ Meteor, Session }, event, activityId) {
    event.preventDefault()

    const user = Meteor.user()
    if (user) {
      window.location.href = `${window.location.origin}/enrollments/${activityId}`
    } else {
      Toast.fail('请先登录', 1)
      Session.set('redirectUrl', `/enrollments/${activityId}`)
      browserHistory.replace(browserHistory.getCurrentLocation().pathname)
      browserHistory.push('/mine')
    }
  },
  loadMoreActivities ({ Meteor, LocalState }) {
    const currentPath = browserHistory.getCurrentLocation().pathname
    if (currentPath === '/activities') {
      const currentActivityPage = LocalState.get('currentActivityPage') || 1
      LocalState.set('currentActivityPage', currentActivityPage + 1)
    }
  }
}
