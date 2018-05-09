import React from 'react'
import { browserHistory } from 'react-router'
import Upload from 'antd/lib/upload'
import Toast from 'antd-mobile/lib/toast'
import InputItem from 'antd-mobile/lib/input-item'
import TextareaItem from 'antd-mobile/lib/textarea-item'
import Tag from 'antd-mobile/lib/tag'
import Button from 'antd-mobile/lib/button'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'
import { createForm } from 'rc-form'

const QuestionNew = ({ user, form, fileList, experts, uploadImage, removeImage, submitQuestion, tagsChange, selectedTags }) => {
  const { getFieldProps } = form
  const uploadButton = (
    <div className='upload-btn'>
      <img className='upload-btn-pic' src='/images/pictures@2x.png' />
      <div className='ant-upload-text'>添加图片</div>
    </div>
  )

  const expertTags = experts.map((expert, i) => {
    const element = (
      <Tag key={i} onChange={(selected) => { tagsChange(selected, experts[i]) }}>
        {expert.profile.nickname}
      </Tag>
    )
    return expert._id !== user._id ? element : ''
  })

  return (
    <div id='question-new'>
      <InputItem
        {...getFieldProps('title', {
          rules: [{ required: true, message: '请输入问题标题' }]
        })}
        placeholder='写下你的问题标题'
      />
      <TextareaItem
        placeholder='描述一下你的问题（选填）'
        {...getFieldProps('content')}
        rows={5}
      />
      <div className='upload'>
        <Upload
          accept='image/*'
          listType='picture-card'
          showUploadList={{'showPreviewIcon': false, 'showRemoveIcon': true}}
          fileList={fileList}
          customRequest={(request) => {
            uploadImage(request)
          }}
          onRemove={(file) => {
            removeImage(file)
          }}
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
      </div>
      {/* 做预览使用，暂时不实现
      <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
        <img alt='example' style={{ width: '100%' }} src={previewImage} />
      </Modal>
      */}
      <div className='question-experts'>
        <span className='experts-tooltip'>请选择回答问题的轮值专家（可多选）</span>
        <div className='expert-tags'>
          { expertTags }
        </div>
      </div>
      <div className='question-submit'>
        <Button
          type='primary'
          className='question-submit-button'
          onClick={(e) => { submitQuestion(e, form, fileList, selectedTags) }}
        >
          发布
        </Button>
      </div>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { LocalState, Meteor, Collections } = context
  const { Users } = Collections
  const fileList = LocalState.get('fileList') || []
  const selectedTags = LocalState.get('selectedTags') || []
  LocalState.set('navText', '发起提问')

  if (Meteor.subscribe('users.current').ready() &&
      Meteor.subscribe('users.experts').ready()) {
    const user = Meteor.user()

    if (user && user.isBan) {
      Toast.fail('你已经被禁言，无法发表新问题', 3)
      browserHistory.push('/questions')
    } else {
      if (!user || !(user && user.username)) {
        browserHistory.push('/mine/login')
      } else {
        const experts = Users.find({
          roles: { $elemMatch: { $in: ['expert'] } },
          isWorking: true
        }).fetch()
        onData(null, { user, fileList, experts, selectedTags })
      }
    }
  } else {
    onData(null, { user: {}, fileList, experts: [], selectedTags: [] })
  }
}

const depsToProps = (context, actions) => ({
  context,
  uploadImage: actions.questions.uploadImage,
  removeImage: actions.questions.removeImage,
  submitQuestion: actions.questions.submitQuestion,
  tagsChange: actions.questions.tagsChange
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(createForm()(QuestionNew))
