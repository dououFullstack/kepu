import React from 'react'
import { Link } from 'react-router'
import List from 'antd-mobile/lib/list'
import Button from 'antd-mobile/lib/button'
import InputItem from 'antd-mobile/lib/input-item'
import { createForm } from 'rc-form'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

const Login = ({ form, loginWithPassword }) => {
  const { getFieldProps } = form

  return (
    <div id='user-login'>
      <List className='user-login-inputs'>
        <InputItem
          {...getFieldProps('telephone', {
            rules: [{ required: true, message: '请输入正确的手机号码' }]
          })}
          placeholder='请输入手机号'
        >
          <div style={{ backgroundImage: 'url(/images/login-1.png)', backgroundSize: 'cover', height: '22px', width: '22px' }} />
        </InputItem>
        <InputItem
          type='password'
          {...getFieldProps('password', {
            rules: [{ required: true, message: '没有密码无法登录！' }]
          })}
          placeholder='请输入密码'
        >
          <div style={{ backgroundImage: 'url(/images/login-2.png)', backgroundSize: 'cover', height: '22px', width: '22px' }} />
        </InputItem>
      </List>
      <Button
        type='primary'
        className='login-submit-button'
        onClick={(e) => { loginWithPassword(e, form) }}
      >
        登录
      </Button>
      <div className='user-login-footer'>
        <Link to='/mine/register'><span className='user-register'>立即注册</span></Link>
        <Link to='/mine/changePassword'><span className='user-forget-password'>忘记密码?</span></Link>
      </div>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { LocalState } = context
  LocalState.set('navText', '登录')

  onData(null, {})
}

const depsToProps = (context, actions) => ({
  context,
  loginWithPassword: actions.users.loginWithPassword
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(createForm()(Login))
