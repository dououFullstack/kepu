import React, { Component } from 'react'
import Icon from 'antd/lib/icon'
import Progress from 'antd/lib/progress'
import Button from 'antd/lib/button'
import Qiniu from 'qiniu4js'
import { merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'

class Upload extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isSuccess: false,
      isUploading: false,
      uploadedFileUrl: '',
      progress: 0,
      fileUploader: null
    }
  }

  componentWillMount () {
    const { context, onChange, accept } = this.props
    const { Meteor, Global, Random } = context
    const { DOMAIN_NAME, UPLOAD_URL } = Global.qiniu
    const fileUploader = new Qiniu.UploaderBuilder()
    .debug(true)
    .domain({http: `http://${UPLOAD_URL}`, https: `https://${UPLOAD_URL}`})
    // .domain({https: `https://${UPLOAD_URL}`})
    .tokenShare(false)
    .chunk(true)
    .multiple(false)
    .accept(accept || ['image/*', 'video/*'])
    .tokenFunc(function (setToken) {
      Meteor.call('getUploadToken', (err, token) => {
        if (!err) {
          setToken(token)
        } else {
          console.log(err)
        }
      })
    })
    // .saveKey(true)
    // .saveKey('$(uuid)_$(imageInfo.width)x$(imageInfo.height)$(ext)')
    .listener({
      onTaskGetKey: (task) => {
        const fileName = task.file.name
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1)
        return `${Random.hexString(8)}.${extension}`
      },
      onStart: (tasks) => {
        this.setState({ isUploading: true })
      },
      onTaskProgress: (progress) => {
        this.setState({ progress: progress._progress })
      },
      onTaskSuccess: (success) => {
        this.setState({ isSuccess: success._isSuccess })
      },
      onTaskFail: (task) => {
      },
      onTaskRetry: (task) => {
      },
      onFinish: (tasks) => {
        console.log(tasks)
        const resultUrl = `${DOMAIN_NAME}${tasks[0]._result.key}`
        this.setState({ isUploading: false })
        this.setState({ uploadedFileUrl: resultUrl })
        Object.assign(tasks[0]._file, { url: resultUrl })
        onChange(tasks[0]._file)
      }
    }).build()
    this.setState({ fileUploader })
  }

  render () {
    const { isUploading, progress, uploadedFileUrl, fileUploader } = this.state
    const { type, text, source, value, showProgress } = this.props
    let isSuccess = this.state.isSuccess
    let imgUrl

    if (value && !isUploading && !isSuccess) {
      imgUrl = value
      isSuccess = true
    } else {
      imgUrl = uploadedFileUrl
    }

    // 图片控件
    const imgContainer = (
      source === 'image' ? <div className='image-content'>
        <img src={imgUrl} />
      </div> : <div className='video-content'><video src={imgUrl} controls='controls'>
        您的浏览器不支持 video 标签。
        </video></div>
    )

    return (
      <div onClick={() => { fileUploader.chooseFile() }} className='upload-container'>
        { isSuccess ? imgContainer : <UploadContainer type={type} text={text} /> }
        { isUploading ? <Progress style={showProgress ? {} : { display: 'none' }} percent={progress} size='small' showInfo={false} /> : '' }
      </div>
    )
  }
}

const UploadContainer = ({ type, text }) => {
  // 上传按钮样式
  const uploadContainer = (
    <div className='upload-content'>
      <Icon type='upload' />
      <p>{ text || '点击上传文件' }</p>
    </div>
  )

  const uploadButton = (
    <Button><Icon type='upload' />{ text || '点击上传文件' }</Button>
  )

  return (
    type === 'button' ? uploadButton : uploadContainer
  )
}

const depsToProps = (context, actions) => ({
  context
})

export default merge(
  useDeps(depsToProps)
)(Upload)
