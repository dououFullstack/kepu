import React from 'react'
import { Router, Route, browserHistory, IndexRedirect } from 'react-router'
import { injectDeps } from 'react-simple-di'

import context from './context'
import actions from '/imports/ui/actions'

import MainLayout from '/imports/ui/components/layouts/mainLayout'
import AdminLayout from '/imports/ui/components/layouts/adminLayout'
import EmptyLayout from '/imports/ui/components/layouts/emptyLayout'

import Enrollments from '/imports/ui/components/enrollments'

import Questions from '/imports/ui/components/questions'
import QuestionDetail from '/imports/ui/components/questions/questionDetail'
import QuestionNew from '/imports/ui/components/questions/questionNew'
import ReplyQuestion from '/imports/ui/components/questions/questionDetail/replyQuestion'
import Activities from '/imports/ui/components/activities'
import ActivityDetail from '/imports/ui/components/activities/activityDetail'
import Videos from '/imports/ui/components/videos'
import VideoDetail from '/imports/ui/components/videos/videoDetail'
import Mine from '/imports/ui/components/users'
import Register from '/imports/ui/components/users/register'
import Login from '/imports/ui/components/users/login'
import UpdateProfile from '/imports/ui/components/users/updateProfile'
import ChangePassword from '/imports/ui/components/users/changePassword'
import MyAnswers from '/imports/ui/components/users/answers'
import Orders from '/imports/ui/components/users/orders'
import InviteExpert from '/imports/ui/components/users/inviteExpert'

import AdminGlobalSettings from '/imports/ui/components/admin/globalSettings/index'
import AdminLogin from '/imports/ui/components/admin/login'
import AdminVideos from '/imports/ui/components/admin/videos'
import AdminVideoNew from '/imports/ui/components/admin/videos/videoNew'
import AdminActivities from '/imports/ui/components/admin/activities'
import AdminActivityNew from '/imports/ui/components/admin/activities/activityNew'
import AdminQuestions from '/imports/ui/components/admin/questions'
import AdminAnswers from '/imports/ui/components/admin/questions/answers'
import AdminEnrollments from '/imports/ui/components/admin/enrollments'
import AdminTransactions from '/imports/ui/components/admin/transactions'
import AdminUsers from '/imports/ui/components/admin/users'

// 将全局 context 和 actions 都注入到每个 Layout 中
// 这样每个 Layout 下面的 components 就都可以得到全局的 context 和 actions 了
const injectDependencies = injectDeps(context, actions)

function routerOnUpdate () {
  const { LocalState, Meteor } = context
  LocalState.set('searchTerm', '')

  const { hash } = window.location
  if (hash !== '') {
    // Push onto callback queue so it runs after the DOM is updated,
    // this is required when navigating from a different page so that
    // the element is rendered on the page before trying to getElementById.
    setTimeout(() => {
      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) element.scrollIntoView()
    }, 200)
  }

  // 访问量统计
  const { location } = window
  const { pathname } = location
  const objectId = pathname.split('/')[2]
  let objectType = ''
  if (pathname.indexOf('/questions/') !== -1 && pathname.length > 11) {
    // questions page
    objectType = 'questions'
  } else if (pathname.indexOf('/videos/') !== -1 && pathname.length > 8) {
    // videos page
    objectType = 'videos'
  } else if (pathname.indexOf('/activities/') !== -1 && pathname.length > 12) {
    // activities page
    objectType = 'activities'
  }

  if (objectType !== '') {
    Meteor.call(`${objectType}.viewCount`, objectId, (err, res) => {
      if (err) {
        console.log(err)
      }
    })
  }
}

const Routes = () => (
  <Router history={browserHistory} onUpdate={routerOnUpdate}>
    {/* 注册、登录、报名、视频详情等页面的 Layout，只有头部的 NavBar */}
    <Route path='/' component={injectDependencies(MainLayout)}>
      <IndexRedirect to='/questions' />
      <Route path='/questions' component={Questions} />
      <Route path='/questions/:questionId' component={QuestionDetail} />
      <Route path='/questionNew' component={QuestionNew} />
      <Route path='/replyQuestion/:questionId' component={ReplyQuestion} />
      <Route path='/activities' component={Activities} />
      <Route path='/activities/:id' component={ActivityDetail} />
      <Route path='/enrollments/:id' component={Enrollments} />
      <Route path='/videos' component={Videos} />
      <Route path='/videos/:videoId' component={VideoDetail} />
      <Route path='/mine' component={Mine} />
      <Route path='/mine/register' component={Register} />
      <Route path='/mine/login' component={Login} />
      <Route path='/mine/activities/:userId' component={Activities} />
      <Route path='/mine/videos/:userId' component={Videos} />
      <Route path='/mine/questions/:userId' component={Questions} />
      <Route path='/mine/answers/:userId' component={MyAnswers} />
      <Route path='/mine/updateProfile' component={UpdateProfile} />
      <Route path='/mine/changePassword' component={ChangePassword} />
      <Route path='/mine/orders' component={Orders} />
      <Route path='/mine/inviteCodes' component={InviteExpert} />
    </Route>

    {/* 管理后台的 Layout */}
    <Route name='admin' path='/admin' breadcrumbName='管理后台' component={injectDependencies(AdminLayout)}>
      <IndexRedirect to='/admin/home' />
      <Route name='home' path='/admin/home' breadcrumbName='全局设置' component={AdminGlobalSettings} />
      <Route name='answers' path='/admin/answers/:questionId' breadcrumbName='回答管理' component={AdminAnswers} />
      <Route name='questions' path='/admin/questions' breadcrumbName='问题管理' component={AdminQuestions} />
      <Route name='activities' path='/admin/activities' breadcrumbName='活动管理' component={AdminActivities} />
      <Route name='activityNew' path='/admin/activityNew' breadcrumbName='新建活动' component={AdminActivityNew} />
      <Route name='activityEdit' path='/admin/activityEdit/:activityId' breadcrumbName='编辑活动' component={AdminActivityNew} />
      <Route name='enrollments' path='/admin/enrollments/:id' breadcrumbName='报名管理' component={AdminEnrollments} />
      <Route name='videos' path='/admin/videos' breadcrumbName='视频管理' component={AdminVideos} />
      <Route name='videoNew' path='/admin/videoNew' breadcrumbName='新建视频' component={AdminVideoNew} />
      <Route name='videoEdit' path='/admin/videoEdit/:videoId' breadcrumbName='编辑视频' component={AdminVideoNew} />
      <Route name='users' path='/admin/users' breadcrumbName='用户管理' component={AdminUsers} />
      <Route name='transactions' path='/admin/transactions' breadcrumbName='交易管理' component={AdminTransactions} />
    </Route>

    {/* Empty Layout */}
    <Route component={injectDependencies(EmptyLayout)}>
      <Route path='/login' component={AdminLogin} />
    </Route>
  </Router>
)

export default Routes
