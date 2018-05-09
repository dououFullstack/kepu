import React from 'react'
import { browserHistory } from 'react-router'
import List from 'antd-mobile/lib/list'
import InputItem from 'antd-mobile/lib/input-item'
import Button from 'antd-mobile/lib/button'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Upload from 'antd/lib/upload'
import { createForm } from 'rc-form'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

import Loading from '/imports/ui/components/loading'

const UpdateProfile = ({ headimgurl, user, form, updateProfileSubmit, chooseHeadimgurl, loading }) => {
  if (loading) {
    return <Loading size='large' height='300px' />
  }

  const { getFieldProps } = form

  return (
    <div id='user-update-profile'>
      <WhiteSpace />
      <List className='user-update-profile-inputs'>
        <Upload
          className='avatar-uploader'
          name='avatar'
          showUploadList={false}
          customRequest={(file) => { chooseHeadimgurl(file) }}
        >
          <List.Item
            className='user-head-img'
            extra={<img src={headimgurl} alt={user.profile.nickname} />}
          >
            选择头像
          </List.Item>
        </Upload>
        <InputItem
          {...getFieldProps('telephone', {
            rules: [{ required: false, message: '请输入手机号码' }],
            initialValue: user.username
          })}
          clear
          disabled
          placeholder='请输入手机号'
        >
          手机（账号）
        </InputItem>
        <InputItem
          {...getFieldProps('nickname', {
            rules: [{ required: true, message: '请输入昵称' }],
            initialValue: user.profile.nickname
          })}
          clear
          placeholder='请输入昵称'
        >
          昵称
        </InputItem>
        <InputItem
          {...getFieldProps('wechat', {
            rules: [{ required: true, message: '请输入微信号码' }],
            initialValue: user.profile.wechat
          })}
          clear
          placeholder='请输入微信号码'
        >
          微信
        </InputItem>
        <InputItem
          {...getFieldProps('email', {
            rules: [{ required: false, message: '请输入邮箱' }],
            initialValue: user.emails && user.emails[0] && user.emails[0].address
          })}
          clear
          placeholder='未设置'
        >
          邮箱（选填）
        </InputItem>
        <InputItem
          {...getFieldProps('address', {
            rules: [{ required: false, message: '请输入地址' }],
            initialValue: user.profile.address
          })}
          clear
          placeholder='未设置'
        >
          地址（选填）
        </InputItem>
      </List>
      <div className='submit-btn'>
        <Button
          type='primary'
          className='update-profile-submit-button'
          onClick={(e) => { updateProfileSubmit(e, form) }}
        >
          提交
        </Button>
      </div>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor, Collections, LocalState } = context
  const { Users } = Collections
  const userId = Meteor.userId()

  LocalState.set('navText', '完善信息')

  if (Meteor.subscribe('users.current', userId).ready()) {
    const user = Users.findOne(userId)
    if (user) {
      LocalState.set('headimgurl', LocalState.get('headimgurl') || user.profile.headimgurl || '/images/mine@2x.png')
      const headimgurl = LocalState.get('headimgurl')
      onData(null, { headimgurl, user, loading: false })
    } else {
      browserHistory.push('/mine/login')
    }
  } else {
    onData(null, { headimgurl: '', user: { profile: {} }, loading: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  updateProfileSubmit: actions.users.updateProfileSubmit,
  chooseHeadimgurl: actions.users.chooseHeadimgurl
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(createForm()(UpdateProfile))
