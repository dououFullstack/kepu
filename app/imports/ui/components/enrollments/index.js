import React from 'react'
import { browserHistory } from 'react-router'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'

import Icon from 'antd/lib/icon'
import List from 'antd-mobile/lib/list'
import InputItem from 'antd-mobile/lib/input-item'
import Picker from 'antd-mobile/lib/picker'
import WhiteSpace from 'antd-mobile/lib/white-space'
import Button from 'antd-mobile/lib/button'
import Upload from 'antd/lib/upload'
import { createForm } from 'rc-form'

import getTrackerLoader from '/imports/api/getTrackerLoader'
import { dateToString2 } from '/imports/lib/helpers'
import Loading from '/imports/ui/components/loading'

const Enrollments = ({
  activity,
  form,
  enrollmentSubmit,
  user,
  attachment,
  attachments,
  uploadAttachment,
  loading,
  checkIDCard,
  checkEmail
}) => {
  if (loading) {
    return <Loading size='large' height='300px' />
  }

  const { getFieldProps } = form
  const gender = [{
    'label': '男',
    'value': '男'
  }, {
    'label': '女',
    'value': '女'
  }]

  const idType = [{
    'label': '身份证',
    'value': '身份证'
  }, {
    'label': '军官证',
    'value': '军官证'
  }]

  const attachmentsList = attachments.map(attachment => (
    attachment.status === 'uploading'
    ? <p key={attachment.key}>{attachment.name}<img src={attachment.url} /></p>
    : <p key={attachment.key}>{attachment.name}</p>
  ))

  return (
    <div id='enrollments'>
      <div className='enroll-activity'>
        <img className='activity-img' src={activity.defaultImage && activity.defaultImage.url} alt={activity.title} />
        <div className='activity-info'>
          <h3 className='activity-title'>{activity.title.length > 30 ? activity.title.slice(0, 30) : activity.title}</h3>
          <span className='activity-endtime'>截止时间：{dateToString2(activity.endTime)}</span>
        </div>
      </div>
      <WhiteSpace />
      <List>
        <InputItem
          {...getFieldProps('username', {
            rules: [{ required: true, message: '请填写姓名' }],
            initialValue: user.profile && user.profile.nickname
          })}
          clear
          placeholder='请输入姓名'
          labelNumber={7}
        >
          报名人姓名
        </InputItem>
      </List>
      <List>
        <Picker
          data={gender}
          cols={1}
          {...getFieldProps('gender', {
            rules: [{ required: true, message: '请选择性别' }],
            initialValue: user.profile && user.profile.sex ? ['男'] : ['女']
          })}
          className='forss'
        >
          <List.Item arrow='horizontal'>
            报名人性别
          </List.Item>
        </Picker>
      </List>
      <List>
        <Picker
          data={idType}
          cols={1}
          value={['identity']}
          {...getFieldProps('idtype', {
            initialValue: ['身份证']
          })}
          className='forss'
        >
          <List.Item arrow='horizontal'>
            报名人证件类型
          </List.Item>
        </Picker>
      </List>
      <List>
        <InputItem
          {...getFieldProps('number', {
            rules: [{
              required: true, message: '请输入证件号'
            }, {
              validator: (rule, value, callback) => checkIDCard(rule, value, callback)
            }]
          })}
          clear
          placeholder='请输入证件号'
          labelNumber={7}
        >
          报名人证件号
        </InputItem>
      </List>
      <WhiteSpace />
      <List>
        <InputItem
          {...getFieldProps('telephone', {
            rules: [{ required: true, message: '请输入联系方式' }],
            initialValue: user.username
          })}
          clear
          placeholder='请输入联系方式'
          labelNumber={7}
        >
          联系方式
        </InputItem>
      </List>
      <List>
        <InputItem
          {...getFieldProps('email', {
            initialValue: user.emails && user.emails[0] && user.emails[0].address
          })}
          clear
          placeholder='请输入联系邮箱'
          labelNumber={7}
        >
          邮箱（非必填）
        </InputItem>
      </List>
      <List>
        <InputItem
          {...getFieldProps('price')}
          clear
          disabled={Boolean(true)}
          value={`${activity.charge}元`}
          placeholder=''
          labelNumber={100}
        >
          总价&nbsp;
          {!activity.refund && activity.charge !== 0 ? <span style={{color: '#007aff'}}>(付款后不支持退款服务，敬请谅解)</span> : ''}
        </InputItem>
      </List>
      <WhiteSpace />
      <List>
        <Upload
          className='attachment-uploader'
          name='attachment'
          showUploadList={false}
          customRequest={(file) => {
            uploadAttachment(file)
          }}
        >
          <List.Item
            arrow='horizontal'
            onClick={() => {}}
            className='upload-file'
          >
            <Icon type='paper-clip' />
            上传附件&nbsp;<span style={{color: '#ccc'}}>(只能上传 pdf、doc、docx 格式)</span>
            { attachmentsList }
          </List.Item>
        </Upload>
      </List>
      <WhiteSpace />
      <div className='enroll-submit-btn'>
        <Button
          className='btn enroll-btn'
          type='primary'
          onClick={(e) => enrollmentSubmit(e, form, activity)}
        >
          {activity.charge ? `${activity.charge}元 确认支付` : `确认报名`}
        </Button>
      </div>
    </div>
  )
}

const reactiveMapper = ({params, context, result}, onData) => {
  const { Meteor, Collections, LocalState, wx } = context
  const { Activities } = Collections
  const attachment = LocalState.get('attachment') || {}
  const attachments = LocalState.get('state.enrollments.attachments') || []
  LocalState.set('navText', '填写报名信息')
  if (Meteor.subscribe('users.current').ready() && result &&
      Meteor.subscribe('activities.activity', params.id).ready()) {
    const user = Meteor.user()
    if (!user || !(user && user.username)) {
      browserHistory.push('/mine/login')
    } else {
      const activity = Activities.findOne(params.id)
      const shareConfig = {
        share: {
          imgUrl: activity.defaultImage.url,
          title: `${activity.title} - 互动科普`,
          desc: activity.content.substr(0, 30),
          link: window.location.href,
          success () {
            // 分享成功后的回调函数
          },
          cancel () {
            // 用户取消分享后执行的回调函数
          }
        }
      }
      wx.config({
        debug: false,
        appId: result.appId,
        timestamp: result.timestamp,
        nonceStr: result.nonceStr,
        signature: result.signature,
        jsApiList: [
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ'
        ]
      })
      wx.ready(() => {
        wx.onMenuShareAppMessage(shareConfig.share)
        wx.onMenuShareTimeline(shareConfig.share)
        wx.onMenuShareQQ(shareConfig.share)
      })
      onData(null, { activity, user, attachment, attachments, loading: false })
    }
  } else {
    onData(null, { activity: {}, user: {}, attachments: [], loading: true })
  }
}

const wechat = ({ context, location }, onData) => {
  const { Meteor } = context

  Meteor.call('wechat.signature', window.location.href, function (error, result) {
    if (!error) {
      onData(null, { result })
    } else {
      console.log(error)
    }
  })
  onData(null, {})
}

const depsToProps = (context, actions) => ({
  context: context,
  enrollmentSubmit: actions.enrollments.enrollmentSubmit,
  uploadAttachment: actions.enrollments.uploadAttachment,
  checkIDCard: actions.enrollments.checkIDCard,
  checkEmail: actions.enrollments.checkEmail
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  compose(wechat, { propsToWatch: [] }),
  useDeps(depsToProps)
)(createForm()(Enrollments))
