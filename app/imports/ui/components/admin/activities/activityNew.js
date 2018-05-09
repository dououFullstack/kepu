import React from 'react'
import Form from 'antd/lib/form'
import Upload from 'antd/lib/upload'
import Icon from 'antd/lib/icon'
import DatePicker from 'antd/lib/date-picker'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import InputNumber from 'antd/lib/input-number'
import Switch from 'antd/lib/switch'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import _ from 'lodash'
import moment from 'moment'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import Uploader from '../../uploader/uploaderSingle'

const RangePicker = DatePicker.RangePicker
const FormItem = Form.Item
const Option = Select.Option
const TextArea = Input.TextArea

const AdminActivityNew = ({
  activity,
  activitySubmit,
  form,
  beforeUpload,
  uploadImage,
  uploadFile,
  defaultImage,
  attachments,
  deleteFileFromList,
  setDefaultImage,
  checkPhoneNumber,
  isCreate
}) => {
  console.log('attachments', attachments)
  const { getFieldDecorator } = form
  const prefixSelector = getFieldDecorator('prefix', {
    initialValue: '86'
  })(
    <Select style={{ width: 60 }}>
      <Option value='86'>+86</Option>
      <Option value='87'>+87</Option>
    </Select>
  )

  const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 }
  }

  const formItemSidebarLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 }
  }

  return (
    <div id='admin-activity-new'>
      <Form onSubmit={(e) => { activitySubmit(e, form, isCreate, activity._id) }}>
        <Row className='activity-info'>
          <Col span={8} className='activity-base-info'>
            <FormItem>
              <Uploader
                type='container'
                accept={['image/*']}
                source='image'
                text='添加默认图片'
                value={defaultImage && defaultImage.url}
                onChange={(imageObject) => setDefaultImage(imageObject)}
                showProgress
              />
              {/* <Upload
                className='avatar-uploader'
                name='avatar'
                showUploadList={false}
                beforeUpload={(file, fileList) => {
                  beforeUpload(file, fileList)
                }}
                customRequest={(request) => {
                  uploadImage(request)
                }}
              >
                {
                  defaultImage && defaultImage.url
                  ? <img src={defaultImage.url} alt='' className='avatar' />
                  : <Icon type='plus' className='avatar-uploader-trigger' />
                }
              </Upload> */}
            </FormItem>
            <FormItem
              label='活动费用'
              {...formItemSidebarLayout}
            >
              {getFieldDecorator('input-number', {
                rules: [{ required: true, message: '请输入活动费用' }],
                initialValue: activity.charge || 0
              })(
                <InputNumber min={0} max={10000} />
              )}
              <span className='ant-form-text'> 元</span>
              {getFieldDecorator('switch', {
                valuePropName: 'checked',
                initialValue: activity.refund
              })(
                <Switch style={{ float: 'right' }} />
              )}
              <span
                className='ant-form-text'
                style={{ float: 'right', lineHeight: '32px' }}>
                允许退费
              </span>
            </FormItem>
            <FormItem
              label='活动时间'
              hasFeedback
              {...formItemSidebarLayout}
            >
              {getFieldDecorator('range-picker', {
                rules: [{ type: 'array', required: true, message: '请选择活动时间!' }],
                initialValue: [moment(activity.beginTime), moment(activity.endTime)]
              })(
                <RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format='YYYY-MM-DD HH:mm'
                />
              )}
            </FormItem>
            <FormItem
              label='联系电话'
              hasFeedback
              {...formItemSidebarLayout}
            >
              {getFieldDecorator('telephone', {
                rules: [{
                  required: true, message: '请输入主办方联系电话'
                }, {
                  validator: (rule, value, callback) => checkPhoneNumber(rule, value, callback)
                }],
                initialValue: activity.telephone
              })(
                <Input placeholder='主办方联系电话' addonBefore={prefixSelector} />
              )}
            </FormItem>
            <FormItem
              label='活动地址'
              hasFeedback
              {...formItemSidebarLayout}
            >
              {getFieldDecorator('address', {
                rules: [{ required: true, message: '请输入活动地址' }],
                initialValue: activity.address
              })(
                <Input placeholder='如 798 艺术区' />
              )}
            </FormItem>
            <FormItem>
              <Upload className='attachments-uploader'
                name='attachments'
                fileList={attachments}
                onRemove={(file) => {
                  deleteFileFromList(file)
                }}
                beforeUpload={(file, fileList) => {
                  beforeUpload(file, fileList, 'attachments')
                }}
                customRequest={(request) => {
                  uploadFile(request)
                }}>
                <Button>
                  <Icon type='upload' />上传附件
                </Button>
              </Upload>
            </FormItem>
            <FormItem>
              <Button type='primary' htmlType='submit' className='submit-btn'>
                <Icon type='plus' />{isCreate ? '创建活动' : '更新活动'}
              </Button>
            </FormItem>
          </Col>
          <Col span={16} className='activity-detail'>
            <FormItem
              label='活动标题'
              hasFeedback
              {...formItemLayout}
            >
              {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入活动标题' }],
                initialValue: activity.title
              })(
                <Input placeholder='请输入活动标题' />
              )}
            </FormItem>
            <FormItem
              label='注意事项'
              hasFeedback
              {...formItemLayout}
            >
              {getFieldDecorator('notice', {
                rules: [{ required: true, message: '注意事项' }],
                initialValue: activity.notice
              })(
                <TextArea placeholder='请输入注意事项' autosize={{ minRows: 6, maxRows: 6 }} />
              )}
            </FormItem>
            <FormItem
              label='活动介绍'
              hasFeedback
              {...formItemLayout}
            >
              {getFieldDecorator('content', {
                rules: [{ required: true, message: '活动介绍' }],
                initialValue: activity.content
              })(
                <TextArea placeholder='请输入活动介绍' autosize={{ minRows: 20, maxRows: 20 }} />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

const reactiveMapper = ({params, context}, onData) => {
  const { Meteor, LocalState, Collections } = context
  const { activityId } = params
  const { Activities } = Collections

  if (activityId && Meteor.subscribe('activities.activity', activityId).ready()) {
    const activity = Activities.findOne(activityId)

    LocalState.set('defaultImage', LocalState.get('defaultImage') || activity.defaultImage)
    LocalState.set('attachments', LocalState.get('attachments') || activity.attachments)

    // setTimeout(() => {
    //   const nodes = window.document.querySelectorAll('a.ant-upload-list-item-name')
    //   for (let i = 0; i < nodes.length; i++) {
    //     const href = nodes[i].getAttribute('href')
    //     const title = nodes[i].getAttribute('title')
    //     if (href.slice(0, 4) !== 'blob') {
    //       // nodes[i].setAttribute('href', `blob:${href}`)
    //       nodes[i].setAttribute('href', href)
    //     }
    //     nodes[i].setAttribute('download', title)
    //   }
    // }, 1000)

    const defaultImage = LocalState.get('defaultImage')
    const attachments = LocalState.get('attachments')
    onData(null, { activity, defaultImage, attachments, isCreate: false })
  } else {
    const defaultImage = LocalState.get('defaultImage') || ''
    const attachments = LocalState.get('attachments') || []
    onData(null, { activity: {}, defaultImage, attachments, isCreate: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  activitySubmit: actions.admin.activitySubmit,
  beforeUpload: actions.admin.beforeUpload,
  uploadImage: actions.admin.uploadImage,
  uploadFile: actions.admin.uploadFile,
  setDefaultImage: (imageObject) => {
    const { LocalState } = context
    LocalState.set('defaultImage', imageObject)
  },
  deleteFileFromList: (file) => {
    const { LocalState } = context
    const attachments = LocalState.get('attachments') || []
    const idx = _.findIndex(attachments, { key: file.key })
    if (idx !== -1) {
      attachments.splice(idx, 1)
    }
    LocalState.set('attachments', attachments)
  },
  checkPhoneNumber: (rule, value, callback) => {
    const re = /^1[3|5|7|8][0-9]\d{8}$|^\d+-\d+$/
    if (!re.test(value)) {
      callback('请输入正确的联系方式')
    } else {
      callback()
    }
  }
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Form.create({})(AdminActivityNew))
