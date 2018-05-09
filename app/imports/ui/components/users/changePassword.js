import React from 'react'
import List from 'antd-mobile/lib/list'
import Button from 'antd-mobile/lib/button'
import InputItem from 'antd-mobile/lib/input-item'
import { createForm } from 'rc-form'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

const ChangePassword = ({
  form,
  telephone,
  getMessageCode,
  getMessageBtn,
  disableGetMessage,
  changePasswordSubmit
}) => {
  const { getFieldProps } = form

  return (
    <div id='user-change-pwd'>
      <List className='user-change-pwd-inputs'>
        <InputItem
          {...getFieldProps('telephone', {
            rules: [{ required: false, message: '请输入手机号码' }]
          })}
          placeholder={telephone}
          disabled
        >
          <div className='input-telephone' />
        </InputItem>
        <InputItem
          {...getFieldProps('code', {
            rules: [{ required: true, message: '请输入手机验证码' }]
          })}
          placeholder='输入验证码'
          extra={
            <span style={disableGetMessage ? { color: '#999' } : { color: '#0089ff' }}
              className='input-get-code' onClick={(e) => {
                getMessageCode(e, form, true)
              }}
            >
              {getMessageBtn}
            </span>
          }
        >
          <div className='input-code' />
        </InputItem>
        <InputItem
          type='password'
          {...getFieldProps('password', {
            rules: [{ required: true, message: '请输入要修改的密码' }]
          })}
          placeholder='设置新密码'
        >
          <div className='input-password' />
        </InputItem>
      </List>
      <Button
        type='primary'
        className='change-pwd-submit-button'
        onClick={(e) => { changePasswordSubmit(e, form) }}
      >
        提交
      </Button>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { LocalState, Meteor } = context
  const getMessageBtn = LocalState.get('getMessagecCountDown') || '获取验证码'
  const disableGetMessage = LocalState.get('disableGetMessage') || false
  const user = Meteor.user()
  let telephone = ''
  if (user) {
    const phoneNumber = user && user.username
    telephone = `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(7, 11)}`
  }
  LocalState.set('navText', '修改密码')
  onData(null, { getMessageBtn, telephone, disableGetMessage })
}

const depsToProps = (context, actions) => ({
  context,
  getMessageCode: actions.users.getMessageCode,
  changePasswordSubmit: actions.users.changePasswordSubmit
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(createForm()(ChangePassword))
