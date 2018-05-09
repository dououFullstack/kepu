import React from 'react'
import { browserHistory } from 'react-router'
import List from 'antd-mobile/lib/list'
import Button from 'antd-mobile/lib/button'
import InputItem from 'antd-mobile/lib/input-item'
import { createForm } from 'rc-form'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import queryString from 'query-string'

const Register = ({context, form, regInvitation, code, userId, registerSubmit, getMessageBtn, getMessageCode, disableGetMessage}) => {
  const { LocalState } = context
  const { getFieldProps } = form

  return (
    <div id='user-register'>
      <List className='user-register-inputs'>
        <InputItem
          {...getFieldProps('telephone', {
            rules: [{ required: true, message: '请输入手机号码' }]
          })}
          placeholder='请输入手机号'
        >
          <div className='input-telephone' />
        </InputItem>
        <InputItem
          {...getFieldProps('code', {
            rules: [{ required: true, message: '请输入手机验证码' }]
          })}
          placeholder='输入验证码'
          extra={<span
            className='input-get-code'
            style={disableGetMessage ? { color: '#999' } : { color: '#0089ff' }}
            onClick={(e) => {
              getMessageCode(e, form)
            }}>{getMessageBtn}</span>}
        >
          <div className='input-code' />
        </InputItem>
        <InputItem
          type='password'
          {...getFieldProps('password', {
            rules: [{ required: true, message: '请输入密码' }]
          })}
          placeholder='设置密码'
        >
          <div className='input-password' />
        </InputItem>
        <InputItem
          type='password'
          {...getFieldProps('confirmPassword', {
            rules: [{ required: true, message: '请输入确认密码' }]
          })}
          placeholder='确认密码'
        >
          <div className='input-confirm-password' />
        </InputItem>
        {regInvitation ? <InputItem
          {...getFieldProps('invitCode', {
            rules: [{ required: true, message: '请输入邀请码！' }],
            initialValue: code
          })}
          placeholder='请输入邀请码'
        >
          <div className='input-invitcode' />
        </InputItem> : ''}
      </List>
      <Button
        type='primary'
        className='register-submit-button'
        onClick={(e) => { registerSubmit(e, form, userId) }}
      >
        注册
      </Button>
      <div className='user-register-footer'>
        <span
          className='user-switch-type'
          onClick={(e) => {
            LocalState.set('regInvitation', !LocalState.get('regInvitation'))
          }}
        >
          {regInvitation ? '注册普通账号' : '注册专家账号'}
        </span>
      </div>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { LocalState, Meteor, Accounts } = context

  let userId = ''
  const search = window.location.search
  const regInvitation = LocalState.get('regInvitation')
  const getMessageBtn = LocalState.get('getMessagecCountDown') || '获取验证码'
  const disableGetMessage = LocalState.get('disableGetMessage') || false

  LocalState.set('navText', '注册')

  // 如果没有微信登录，则先使用微信登录，注册时才能拿到微信的 userId 来绑定用户名和 email
  if (Accounts.loginServicesConfigured()) {
    const user = Meteor.user()
    if (user) {
      if (user.username) {
        // 已注册用户直接跳转到用户资料页面
        browserHistory.push('/mine')
      } else {
        // 未注册用户获取当前已经登录的微信用户 id 给页面用来绑定用户名和密码
        userId = Meteor.userId()
        let code = ''
        if (search !== '') {
          const query = queryString.parse(search)
          code = query.code
          LocalState.set('regInvitation', true)
        }
        onData(null, { regInvitation, code, getMessageBtn, disableGetMessage, userId: userId })
      }
    } else {
      if (!Meteor.loggingIn()) {
        // 如果不是正在登录中，就尝试登录。
        Meteor.loginWithWeChatMP(function (e, res) {
          // Callback is never called
          // See this issue: https://github.com/zhaoyao91/meteor-accounts-wechat-mp/issues/3
        })
      }
    }
  }
}

const depsToProps = (context, actions) => ({
  context,
  registerSubmit: actions.users.registerSubmit,
  getMessageCode: actions.users.getMessageCode
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(createForm()(Register))
