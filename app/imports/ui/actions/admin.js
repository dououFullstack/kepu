import { browserHistory } from 'react-router'
import notification from 'antd/lib/notification'
import UploadFile from './files'
import _ from 'underscore'

export default {
  linkTo ({ Meteor }, item) {
    if (item.key === 'logout') {
      return Meteor.logout()
    }
    browserHistory.push(item.key)
  },
  activitySubmit ({ Meteor, LocalState }, e, form, isCreate, activityId) {
    e.preventDefault()

    form.validateFields((err, values) => {
      if (!err) {
        const activityObj = {
          title: values['title'],
          content: values['content'],
          defaultImage: LocalState.get('defaultImage') || {},
          address: values['address'],
          beginTime: values['range-picker'][0].toDate(),
          endTime: values['range-picker'][1].toDate(),
          charge: values['input-number'],
          refund: values['switch'],
          notice: values['notice'],
          telephone: values['telephone'],
          attachments: LocalState.get('attachments') || []
        }

        const action = isCreate ? 'create' : 'update'

        Meteor.call(`activities.${action}`, activityObj, activityId, (err, res) => {
          if (!err) {
            browserHistory.replace('/admin')
            browserHistory.push('/admin/activities')
          } else {
            notification['error']({
              message: '操作失败',
              description: `${action} 活动失败，${err.message}`
            })
          }
        })
      } else {
        console.log(err)
      }
    })
  },
  beforeUpload ({ Meteor }, file, fileList, type = 'defaultImage') {
  },
  uploadImage ({ Meteor, LocalState, Global }, request) {
    const defaultImage = {
      key: request.file.uid,
      uid: request.file.uid,
      name: request.file.name,
      status: LocalState.get(request.file.uid) || 'uploading',
      url: LocalState.get(`${request.file.uid}_Url`) || '/images/spinner.gif'
    }

    LocalState.set('defaultImage', defaultImage)

    UploadFile(
      request.file.uid,
      request.file.name,
      'image',
      request.file,
      Meteor, (data, error) => {
        if (!error) {
          const uploadedFile = {
            key: data.uid,
            uid: data.uid,
            name: data.name,
            status: data.status,
            url: Global.qiniu.DOMAIN_NAME + data.url
          }

          LocalState.set('defaultImage', uploadedFile)
        } else {
          notification['error']({
            message: '上传错误',
            description: `上传 ${data.name} 失败！${error}`
          })
        }
      }
    )
  },
  uploadFile ({ Meteor, LocalState, Global }, request) {
    let fileType
    if (request.file.name.split('.').pop() === 'doc' ||
        request.file.name.split('.').pop() === 'docx') {
      fileType = 'document'
    } else if (request.file.name.split('.').pop() === 'pdf') {
      fileType = 'pdf'
    } else {
      return notification['error']({
        message: '上传错误',
        description: `只允许上传 pdf、doc、docx 格式的文件`
      })
    }

    const attachments = LocalState.get('attachments') || []
    const attachment = {
      key: request.file.uid,
      uid: request.file.uid,
      name: request.file.name,
      status: LocalState.get(request.file.uid) || 'uploading',
      url: LocalState.get(`${request.file.uid}_Url`) || '/images/spinner.gif'
    }
    attachments.push(attachment)
    LocalState.set('attachments', attachments)

    UploadFile(
      request.file.uid,
      request.file.name,
      fileType,
      request.file,
      Meteor, (data, error) => {
        // 上传完成的回调
        if (!error) {
          let newAttachments = []
          // 成功后从现有 fileList 中遍历得到刚刚上传的文件信息，修改其上传完成状态并显示上传后的文件地址
          attachments.map((d, i) => {
            if (d.uid !== data.uid) {
              newAttachments.push(d)
            } else {
              const attachment = {
                key: data.uid,
                uid: data.uid,
                name: data.name,
                status: data.status,
                url: Global.qiniu.DOMAIN_NAME + data.url
              }
              newAttachments.push(attachment)
            }
          })
          LocalState.set('attachments', newAttachments)
        } else {
          notification['error']({
            message: '上传错误',
            description: `上传 ${data.name} 失败！${error}`
          })
        }
      })
  },
  deleteActivity ({ Meteor }, event, activityId) {
    Meteor.call('activities.delete', activityId, (err, res) => {
      if (!err) {
        notification['success']({
          message: '删除成功',
          description: '删除活动成功'
        })
      } else {
        notification['error']({
          message: '删除失败',
          description: err.message
        })
      }
    })
  },
  deleteVideo ({ Meteor }, event, videoId) {
    Meteor.call('videos.delete', videoId, (err, res) => {
      if (!err) {
        notification['success']({
          message: '删除成功',
          description: '删除视频成功'
        })
      } else {
        notification['error']({
          message: '删除失败',
          description: err.message
        })
      }
    })
  },
  uploadVideo ({ Meteor, Global, LocalState }, request) {
    const defaultVideo = {
      key: request.file.uid,
      uid: request.file.uid,
      name: request.file.name,
      type: 'img',
      status: LocalState.get(request.file.uid) || 'uploading',
      url: LocalState.get(`${request.file.uid}_Url`) || '/images/spinner.gif'
    }

    LocalState.set('defaultVideo', defaultVideo)

    UploadFile(
      request.file.uid,
      request.file.name,
      'video',
      request.file,
      Meteor, (data, error) => {
        // 上传完成的回调
        if (!error) {
          const uploadedFile = {
            key: data.uid,
            uid: data.uid,
            name: data.name,
            status: data.status,
            type: 'video',
            url: Global.qiniu.DOMAIN_NAME + data.url
          }
          LocalState.set('defaultVideo', uploadedFile)
        } else {
          notification['error']({
            message: '上传错误',
            description: `上传 ${data.name} 失败！${error}`
          })
        }
      })
  },
  videoSubmit ({ Meteor, LocalState }, e, form, isCreate, videoId) {
    e.preventDefault()

    form.validateFields((err, values) => {
      if (!err) {
        const defaultImage = LocalState.get('defaultImage')
        const defaultVideo = LocalState.get('defaultVideo')
        const showChargeInput = LocalState.get('showChargeInput')
        if (!defaultImage || !defaultVideo) {
          return notification['error']({
            message: '保存失败',
            description: '请确保视频和预览图片上传完毕'
          })
        }

        const videoObj = {
          title: values['title'],
          content: values['content'],
          defaultImage: defaultImage,
          defaultVideo: defaultVideo,
          charge: showChargeInput ? values['input-number'] : 0,
          freeTime: values['free-number'] || 0
        }

        const action = isCreate ? 'create' : 'update'

        Meteor.call(`videos.${action}`, videoObj, videoId, (err, res) => {
          if (!err) {
            browserHistory.replace('/admin/videos')
            browserHistory.push('/admin/videos')
          } else {
            console.log(err)
          }
        })
      } else {
        console.log(err)
      }
    })
  },
  deleteQuestions ({ Meteor, LocalState }, questionIds) {
    const removeQuestionIds = []

    questionIds.map((question, i) => {
      removeQuestionIds.push(question.key)
    })

    Meteor.call('questions.removeByIds', removeQuestionIds, (err, res) => {
      if (!err) {
        notification['success']({
          message: '删除成功',
          description: '删除问题成功'
        })
        LocalState.set('selectedRowKeys', [])
      } else {
        notification['error']({
          message: '删除失败',
          description: err.message
        })
      }
    })
  },
  quesetionSelectChange ({ Meteor, LocalState }, questionIds, selectedRowKeys) {
    LocalState.set('selectedRowKeys', selectedRowKeys)
  },
  setWorkState ({ Meteor }, userId, state) {
    Meteor.call('users.setExpertState', userId, state, (err, res) => {
      if (!err) {
        notification['success']({
          message: '操作成功',
          description: '设置专家工作状态成功'
        })
      } else {
        notification['error']({
          message: '操作失败',
          description: err.message
        })
      }
    })
  },
  banUser ({ Meteor }, userId, isBan) {
    Meteor.call('users.ban', userId, isBan, (err, res) => {
      if (!err) {
        notification['success']({
          message: '操作成功',
          description: '设置用户属性成功'
        })
      } else {
        notification['error']({
          message: '操作失败',
          description: err.message
        })
      }
    })
  },
  setVisible ({ Meteor }, videoId, isVisible) {
    Meteor.call('videos.setVisible', videoId, isVisible, (err, res) => {
      if (!err) {
        notification['success']({
          message: '设置成功',
          description: '设置视频显示状态成功。'
        })
      } else {
        notification['error']({
          message: '设置失败',
          description: err.message
        })
      }
    })
  },
  createInviteCode ({ Meteor }, e, form) {
    e.preventDefault()

    form.validateFields((error, values) => {
      if (!error) {
        const { count } = values
        Meteor.call('inviteCodes.create', count, (err, res) => {
          if (!err) {
            notification['success']({
              message: '操作成功',
              description: `创建 ${count} 个邀请码成功`
            })
          } else {
            notification['error']({
              message: '创建失败',
              description: err.message
            })
          }
        })
      } else {
        console.log(error)
      }
    })
  },
  setQuestionVisible ({ Meteor }, questionId, isVisible) {
    Meteor.call('questions.setVisible', questionId, isVisible, (err, res) => {
      if (!err) {
        notification['success']({
          message: '设置成功',
          description: '设置问题显示状态成功。'
        })
      } else {
        notification['error']({
          message: '操作失败',
          description: err.message
        })
      }
    })
  },
  globalSettingsSubmit ({ Meteor }, e, form) {
    e.preventDefault()

    form.validateFields((err, values) => {
      if (!err) {
        // 后期添加新的设置，需要改造函数
        const { showTime } = values
        const globalSettings = {
          showTime: showTime
        }
        Meteor.call('globalSettings.set', globalSettings, (err, res) => {
          if (!err) {
            notification['success']({
              message: '设置成功',
              description: '保存设置成功，设置将立即生效。'
            })
          } else {
            notification['error']({
              message: '操作失败',
              description: err.message
            })
          }
        })
      } else {
        _.values(err).map((obj, i) => {
          if (i === 0) {
            notification['error']({
              message: '操作失败',
              description: obj.errors[0].message
            })
          }
        })
      }
    })
  },
  searchSubmit ({ Meteor, LocalState }, searchTerm) {
    if (searchTerm !== '' && searchTerm !== null && searchTerm !== undefined) {
      LocalState.set('searchTerm', searchTerm)
    }
  },
  resetSearch ({ Meteor, LocalState }) {
    LocalState.set('searchTerm', null)
  },
  doRefund ({ Meteor }, e, order, refund) {
    Meteor.call('wechat.refund', order, refund, (err, res) => {
      if (!err) {
        notification['success']({
          message: '操作完成',
          description: refund ? '允许用户退款，款项会原路退款给用户' : '已拒绝用户退款请求'
        })
      } else {
        notification['error']({
          message: '退款操作失败',
          description: err.message
        })
      }
    })
  },
  setUserRoles ({ Meteor }, userId, isExpert, userRole) {
    Meteor.call('users.setRoles', userId, isExpert, userRole, (err, res) => {
      if (!err) {
        notification['success']({
          message: '操作成功',
          description: '设置专家属性成功'
        })
      } else {
        notification['error']({
          message: '操作失败',
          description: err.message
        })
      }
    })
  },
  showChargeInput ({ Meteor, LocalState }, event) {
    console.log(event.target.value)
    if (event.target.value === 'topay') {
      LocalState.set('showChargeInput', true)
    } else {
      LocalState.set('showChargeInput', false)
    }
  }
}
