import { browserHistory } from 'react-router'
import Toast from 'antd-mobile/lib/toast'
import _ from 'underscore'

import UploadFile from './files'

export default {
  enrollmentSubmit ({ Meteor, Collections, swal, Global, wx, LocalState }, event, form, activity, cb) {
    event.preventDefault()

    form.validateFields((err, values) => {
      if (!err) {
        // 生成报名信息
        const { username, gender, idtype, number, telephone, email } = values
        const enrollment = {
          activityId: activity._id,
          userId: Meteor.userId(),
          username: username,
          status: 1,
          gender: gender[0],
          IDCardType: idtype[0],
          IDCardNumber: number,
          telephone: telephone,
          email: email,
          attachments: LocalState.get('state.enrollments.attachments') || []
        }

        // 是否需要支付
        if (activity.charge) {
          Meteor.call('wechat.getPayRequestParams', {
            activityId: activity._id,
            charge: activity.charge,
            refund: activity.refund
          }, (err, res) => {
            if (err) {
              throw new Meteor.Error(err)
            }
            // 生成支付订单
            wx.chooseWXPay({
              appId: Global.wechat.appId,
              timestamp: res.timeStamp,
              nonceStr: res.nonceStr,
              package: res.package,
              signType: res.signType,
              paySign: res.paySign,
              success (res) {
                if (res.errMsg === 'chooseWXPay:ok') {
                  Meteor.call('enrollments.create', enrollment, (error, result) => {
                    if (!error) {
                      Toast.success('报名成功', 3)
                      browserHistory.replace('/activities')
                      browserHistory.push(`/activities/${activity._id}`)
                    } else {
                      Toast.fail(`报名失败，${error.message}`, 3)
                    }
                  })
                } else {
                  Toast.fail(`报名失败，${res.errMsg}`, 3)
                }
              },
              fail (res) {
                Toast.fail(`支付失败，${res.errMsg}`, 3)
              },
              cancel (res) {
                // Toast.fail(`取消支付，${res.errMsg}`, 3)
              }
            })
          })
        } else {
          Meteor.call('enrollments.create', enrollment, true, (error, result) => {
            if (!error) {
              Toast.success('报名成功', 3)
              browserHistory.replace('/activities')
              browserHistory.push(`/activities/${activity._id}`)
            } else {
              Toast.fail(`报名失败，${error.message}`, 3)
            }
          })
        }
      } else {
        _.values(err).map((obj, i) => {
          if (i === 0) {
            Toast.fail(obj.errors[0].message, 3)
          }
        })
      }
    })
  },
  uploadAttachment ({ Meteor, LocalState, Global }, request) {
    let fileType
    if (request.file.name.split('.').pop() === 'doc' ||
        request.file.name.split('.').pop() === 'docx') {
      fileType = 'document'
    } else if (request.file.name.split('.').pop() === 'pdf') {
      fileType = 'pdf'
    } else {
      return Toast.fail('只允许上传 pdf、doc、docx 格式的文件', 3)
    }

    const attachments = LocalState.get('state.enrollments.attachments') || []
    attachments.push({
      key: request.file.uid,
      uid: request.file.uid,
      name: request.file.name,
      type: 'img',
      status: LocalState.get(request.file.uid) || 'uploading',
      url: LocalState.get(`${request.file.uid}_Url`) || '/images/spinner.gif'
    })

    // const attachment = {
    //   key: request.file.uid,
    //   uid: request.file.uid,
    //   name: request.file.name,
    //   type: 'img',
    //   status: LocalState.get(request.file.uid) || 'uploading',
    //   url: LocalState.get(`${request.file.uid}_Url`) || '/images/spinner.gif'
    // }

    LocalState.set('state.enrollments.attachments', attachments)
    // LocalState.set('attachment', attachment)

    UploadFile(
      request.file.uid,
      request.file.name,
      fileType,
      request.file,
      Meteor, (data, error) => {
        // 上传完成的回调
        if (!error) {
          const attachments = LocalState.get('state.enrollments.attachments') || []
          const idx = _.findIndex(attachments, { key: data.uid })
          if (idx !== -1) {
            attachments[idx].status = data.status
            attachments[idx].url = Global.qiniu.DOMAIN_NAME + data.url
          }
          LocalState.set('state.enrollments.attachments', attachments)
          // LocalState.set('attachment', uploadedFile)
        } else {
          Toast.fail(`上传 ${data.name} 失败！${error}`, 3)
        }
      })
  },
  checkIDCard ({ Meteor }, rule, value, callback) {
    const re = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!re.test(value)) {
      callback('请输入正确的身份证号')
    } else {
      callback()
    }
  },
  checkEmail ({ Meteor }, rule, value, callback) {
    const re = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
    if (!re.test(value)) {
      callback('请输入正确的邮箱地址')
    } else {
      callback()
    }
  }
}
