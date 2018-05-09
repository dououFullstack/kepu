import { browserHistory } from 'react-router'
import Toast from 'antd-mobile/lib/toast'
import UploadFile from './files'
import _ from 'underscore'

export default {
  loadMore ({ Meteor }, event, questionId, anchor = null) {
    event.preventDefault()
    browserHistory.push(`/questions/${questionId}${anchor || ''}`)
  },
  reply ({ Meteor }, event, questionId) {
    event.preventDefault()
    browserHistory.push(`/replyQuestion/${questionId}`)
  },
  uploadImage ({ Meteor, LocalState, Global }, request) {
    // 先获取一下当前 fileList 中的文件列表
    const files = LocalState.get('fileList') || []
    // 根据传递进来的文件信息构建一个新的文件，默认是 loading 状态并设置显示为 loading 的 gif 动画
    const file = {
      key: request.file.uid,
      uid: request.file.uid,
      name: request.file.name,
      status: LocalState.get(request.file.uid) || 'loading',
      url: LocalState.get(`${request.file.uid}_Url`) || '/images/spinner.gif'
    }
    // 将文件 push 到 fileList 中，让 UI 端产生变化
    files.push(file)
    LocalState.set('fileList', files)

    // 开始上传文件到七牛
    UploadFile(
      request.file.uid,
      request.file.name,
      'image',
      request.file,
      Meteor, (data, error) => {
        // 上传完成的回调
        if (!error) {
          let newFiles = []
          // 成功后从现有 fileList 中遍历得到刚刚上传的文件信息，修改其上传完成状态并显示上传后的文件地址
          files.map((d, i) => {
            if (d.uid !== data.uid) {
              newFiles.push(d)
            } else {
              const file = {
                key: data.uid,
                uid: data.uid,
                name: data.name,
                status: data.status,
                url: Global.qiniu.DOMAIN_NAME + data.url
              }
              newFiles.push(file)
            }
          })
          LocalState.set('fileList', newFiles)
        } else {
          Toast.fail(`上传 ${data.name} 失败！${error}`, 3)
        }
      })
  },
  removeImage ({ Meteor, LocalState }, file) {
    // 从 fileList 的本地状态中移除被 UI 层点击了删除按钮的图片
    // file 是从 UI 层传递过来的要删除的文件信息
    // 遍历已有的 fileList，对比 uid 相同则从 fileList 中删除
    // 最后重新设置给 UI 层显示
    const files = LocalState.get('fileList')
    const newFiles = []

    files.map((d, i) => {
      if (d.uid !== file.uid) {
        newFiles.push(d)
      }
    })

    LocalState.set('fileList', newFiles)
  },
  tagsChange ({ Meteor, LocalState }, selected, selectedTag) {
    let selectedTagIds = LocalState.get('selectedTags') || []

    if (selected) {
      // 如果是选择，则添加到数组中
      selectedTagIds.push(selectedTag._id)
    } else {
      // 如果是取消，则从数组中删除
      selectedTagIds = _.without(selectedTagIds, selectedTag._id)
    }

    LocalState.set('selectedTags', selectedTagIds)
  },
  submitAnswer ({ Meteor }, event, questionId, form) {
    event.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        const { content } = values
        Meteor.call('answers.create', questionId, content, function (e, res) {
          if (!e) {
            browserHistory.replace('/questions')
            browserHistory.push(`/questions/${questionId}`)
          } else {
            throw new Meteor.Error(err)
          }
        })
      } else {
        console.log(err)
        Toast.fail('请输入您要回复的内容！', 1)
      }
    })
  },
  submitQuestion ({ Meteor }, event, form, fileList, selectedTags) {
    event.preventDefault()

    form.validateFields((err, values) => {
      if (!err) {
        const { title, content } = values
        Meteor.call('questions.create', title, content, fileList, selectedTags, function (e, res) {
          if (!e) {
            Toast.success('发表成功，请等待审核通过')
            browserHistory.replace('/questions')
            browserHistory.push(`/questions`)
          } else {
            Toast.fail(`发表失败${e.message}`)
          }
        })
      } else {
        Toast.fail('请输入问题标题', 3)
      }
    })
  },
  deleteQuestion ({ Meteor }, questionId) {
    const userId = Meteor.userId()
    Meteor.call('questions.delete', questionId, userId, (err, res) => {
      if (!err) {
        Toast.success(`删除成功`)
        browserHistory.replace('/questions')
        browserHistory.push('/questions')
      } else {
        Toast.fail(`删除失败${err.message}`)
      }
    })
  },
  deleteAnswer ({ Meteor }, answerId) {
    const userId = Meteor.userId()
    Meteor.call('answers.delete', answerId, userId, (err, res) => {
      if (!err) {
        Toast.success(`删除成功`)
      } else {
        Toast.fail(`删除失败${err.message}`)
      }
    })
  },
  loadMoreQuestions ({ Meteor, LocalState }) {
    const currentPath = browserHistory.getCurrentLocation().pathname
    if (currentPath === '/questions') {
      const currentQuestionPage = LocalState.get('currentQuestionPage') || 1
      LocalState.set('currentQuestionPage', currentQuestionPage + 1)
    }
  },
  like ({ Meteor }, event, answerId, liked) {
    Meteor.call('answers.toggleLike', answerId, liked, (err, res) => {
      if (err) {
        Toast.fail(err.message)
      }
    })
  }
}
