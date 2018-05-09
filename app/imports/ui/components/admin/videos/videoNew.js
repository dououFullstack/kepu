import React from 'react'
import Form from 'antd/lib/form'
import Upload from 'antd/lib/upload'
import Icon from 'antd/lib/icon'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Radio from 'antd/lib/radio'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import Uploader from '../../uploader/uploaderSingle'

const FormItem = Form.Item
const TextArea = Input.TextArea

const AdminVideoNew = ({
  video,
  videoSubmit,
  form,
  uploadVideo,
  uploadImage,
  defaultVideo,
  defaultImage,
  onShowCharge,
  showChargeInput,
  setDefaultImage,
  setDefaultVideo,
  isCreate
}) => {
  const { getFieldDecorator } = form

  const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 }
  }

  const formItemSidebarLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 }
  }

  return (
    <div id='admin-video-new'>
      <Form onSubmit={(e) => { videoSubmit(e, form, isCreate, video._id) }}>
        <Row className='video-info'>
          <Col span={8} className='video-base-info'>
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
                accept='image/*'
                showUploadList={false}
                customRequest={(request) => {
                  uploadImage(request)
                }}
              >
                {
                  defaultImage && defaultImage.url
                  ? <img src={defaultImage.url} alt='' className='avatar' />
                  : <span className='avatar-uploader-trigger'>添加默认图片</span>
                }
              </Upload> */}
            </FormItem>
            <FormItem>
              <Uploader
                type='container'
                accept={['video/*']}
                source='video'
                text='添加视频'
                value={defaultVideo && defaultVideo.url}
                onChange={(videoObject) => setDefaultVideo(videoObject)}
                showProgress
              />
              {/* <Upload
                className='avatar-uploader'
                name='avatar'
                accept='video/*'
                showUploadList={false}
                customRequest={(request) => {
                  uploadVideo(request)
                }}
              >
                {
                  defaultVideo && defaultVideo.url
                  ? defaultVideo.url === '/images/spinner.gif' ? <img src='/images/spinner.gif' /> : <video src={defaultVideo.url} controls className='avatar' />
                  : <span className='avatar-uploader-trigger'>添加视频</span>
                }
              </Upload> */}
            </FormItem>
            <FormItem>
              <Radio.Group onChange={(e) => { onShowCharge(e) }}>
                <Radio.Button value='free' checked={!showChargeInput}>免费</Radio.Button>
                <Radio.Button value='topay' checked={showChargeInput}>收费</Radio.Button>
              </Radio.Group>
            </FormItem>
            { showChargeInput ? <div>
              <FormItem
                label='视频费用'
                {...formItemSidebarLayout}
              >
                {getFieldDecorator('input-number', {
                  rules: [{ required: true, message: '请输入视频费用' }],
                  initialValue: video.charge || 0
                })(
                  <InputNumber min={0} max={10000} />
                )}
                <span className='ant-form-text'> 元</span>
              </FormItem>
              <FormItem
                label='免费时长'
                {...formItemSidebarLayout}
              >
                {getFieldDecorator('free-number', {
                  rules: [{ required: true, message: '请输入视频免费时长' }],
                  initialValue: video.freeTime || 0
                })(
                  <InputNumber min={0} max={10000} />
                )}
                <span className='ant-form-text'> 秒</span>
              </FormItem>
            </div> : ''}
            <FormItem>
              <Button type='primary' htmlType='submit' className='submit-btn'>
                <Icon type='plus' />{isCreate ? '新建视频' : '更新视频'}
              </Button>
            </FormItem>
          </Col>
          <Col span={16} className='video-detail'>
            <FormItem
              label='视频标题'
              hasFeedback
              {...formItemLayout}
            >
              {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入视频标题' }],
                initialValue: video.title
              })(
                <Input placeholder='请输入视频标题' />
              )}
            </FormItem>
            <FormItem
              label='视频介绍'
              hasFeedback
              {...formItemLayout}
            >
              {getFieldDecorator('content', {
                rules: [{ required: true, message: '视频介绍' }],
                initialValue: video.content
              })(
                <TextArea placeholder='请输入视频介绍' autosize={{ minRows: 27, maxRows: 27 }} />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

/**
 * const defaultImage = LocalState.get('defaultImage')
        const defaultVideo = LocalState.get('defaultVideo')
 */

const reactiveMapper = ({params, context}, onData) => {
  const { Meteor, LocalState, Collections } = context
  const { videoId } = params
  const { Videos } = Collections

  if (videoId && Meteor.subscribe('videos.video', videoId).ready()) {
    const video = Videos.findOne(videoId)

    LocalState.set('defaultVideo', LocalState.get('defaultVideo') || video.defaultVideo)
    LocalState.set('defaultImage', LocalState.get('defaultImage') || video.defaultImage)
    if (LocalState.get('showChargeInput') !== undefined && LocalState.get('showChargeInput') !== null) {
      LocalState.set('showChargeInput', LocalState.get('showChargeInput'))
    } else {
      LocalState.set('showChargeInput', video.charge > 0)
    }

    const defaultVideo = LocalState.get('defaultVideo')
    const defaultImage = LocalState.get('defaultImage')
    const showChargeInput = LocalState.get('showChargeInput')
    onData(null, { video, defaultVideo, defaultImage, showChargeInput, isCreate: false })
  } else {
    const defaultVideo = LocalState.get('defaultVideo') || ''
    const defaultImage = LocalState.get('defaultImage') || ''
    const showChargeInput = LocalState.get('showChargeInput') || false
    onData(null, { video: {}, defaultVideo, defaultImage, showChargeInput, isCreate: true })
  }
}

const depsToProps = (context, actions) => ({
  context,
  uploadVideo: actions.admin.uploadVideo,
  videoSubmit: actions.admin.videoSubmit,
  uploadImage: actions.admin.uploadImage,
  onShowCharge: actions.admin.showChargeInput,
  setDefaultImage: (imageObject) => {
    const { LocalState } = context
    LocalState.set('defaultImage', imageObject)
  },
  setDefaultVideo: (videoObject) => {
    const { LocalState } = context
    LocalState.set('defaultVideo', { url: videoObject.url })
  }
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Form.create({})(AdminVideoNew))
