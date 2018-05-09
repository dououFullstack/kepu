import { browserHistory } from 'react-router'
import Toast from 'antd-mobile/lib/toast'
import _ from 'underscore'
import UploadFile from './files'

export default {
  loginWithPassword ({ Meteor, Session }, event, form) {
    event.preventDefault()

    form.validateFields((err, values) => {
      const { telephone, password } = values

      if (!err) {
        Meteor.loginWithPassword(telephone, password, (err) => {
          if (!err) {
            const redirectUrl = Session.get('redirectUrl') || '/mine'
            // browserHistory.push(redirectUrl)
            window.location.href = redirectUrl
          } else {
            Toast.fail(`登录失败，${err.message}`, 3)
          }
        })
      } else {
        _.values(err).map((obj, i) => {
          if (i === 0) {
            Toast.fail(obj.errors[0].message, 3)
          }
        })
      }
    })
  },
  changePasswordSubmit ({ Meteor }, event, form) {
    event.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        const { code, password } = values
        const telephone = Meteor.user().username

        // 验证短信验证码
        Meteor.call('users.changePassword', telephone, code, password, (err, res) => {
          if (!err) {
            Toast.success('修改密码成功', 3)
            browserHistory.push('/mine')
          } else {
            Toast.fail(`修改密码失败${err.message}`, 3)
          }
        })
      }
    })
  },
  registerSubmit ({ Meteor, LocalState, Session }, event, form, userId) {
    event.preventDefault()
    const regInvitation = LocalState.get('regInvitation') || false

    form.validateFields((err, values) => {
      if (!err) {
        const { telephone, code, password, confirmPassword, invitCode } = values

        // 验证密码是否一致
        if (password !== confirmPassword) {
          return Toast.fail('两次输入的密码不一致！', 3)
        }

        // 验证短信验证码
        Meteor.call('messages.check', telephone, code, (err, res) => {
          if (!err) {
            Meteor.call('users.create', userId, telephone, password, regInvitation, invitCode || '', (error, result) => {
              if (!error) {
                Meteor.loginWithPassword(telephone, password, (loginError, loginResult) => {
                  if (!loginError) {
                    const redirectUrl = Session.get('redirectUrl') || '/mine'
                    Toast.success('注册成功', 3)
                    // browserHistory.push(redirectUrl)
                    // 用下面的方式可以解决支付时目录不对的情况
                    window.location.href = redirectUrl
                  } else {
                    Toast.fail(`登录失败${loginError.message}`, 3)
                  }
                })
              } else {
                Toast.fail(`注册失败${error.message}`, 3)
              }
            })
          } else {
            Toast.fail(`注册失败${err.reason}`, 3)
          }
        })
      } else {
        _.values(err).map((obj, i) => {
          if (i === 0) {
            Toast.fail(obj.errors[0].message, 3)
          }
        })
      }
    })
  },
  getMessageCode ({ Meteor, LocalState }, event, form, isChangePassword) {
    event.preventDefault()

    if (!LocalState.get('disableGetMessage')) {
      form.validateFields((e, values) => {
        // 判断输入的手机号码是否合法
        const regxMobile = /^0?1[3|4|5|7|8][0-9]\d{8}$/
        let telephone = ''
        if (isChangePassword) {
          const user = Meteor.user()
          telephone = user.username
        } else {
          telephone = values.telephone
        }

        // 如果号码不合法则弹出提示，如果合法则调用服务端发送短信方法
        if (!telephone || !(telephone && regxMobile.test(telephone))) {
          Toast.fail('错误的手机号码', 3)
        } else {
          Meteor.call('messages.send', telephone, (error, res) => {
            if (!error) {
              // 如果发送成功，那么禁用前端按钮并设置倒计时
              let countDown = 59
              LocalState.set('getMessagecCountDown', '重新获取(60秒)')
              LocalState.set('disableGetMessage', true)
              const interval = setInterval(() => {
                if (countDown === 0) {
                  LocalState.set('disableGetMessage', false)
                  LocalState.set('getMessagecCountDown', '重新获取')
                  clearInterval(interval)
                } else {
                  LocalState.set('getMessagecCountDown', `重新获取(${countDown}秒)`)
                  countDown--
                }
              }, 1000)
              Toast.success('发送验证码成功')
            } else {
              // 发送失败提示后台 throw 出来的错误信息
              Toast.fail(error.message, 3)
            }
          })
        }
      })
    }
  },
  chooseHeadimgurl ({ Meteor, LocalState, Global }, request) {
    LocalState.set('headimgurl', '/images/spinner.gif')

    UploadFile(
      request.file.uid,
      request.file.name,
      'image',
      request.file,
      Meteor, (data, error) => {
        if (!error) {
          LocalState.set('headimgurl', Global.qiniu.DOMAIN_NAME + data.url)
          Toast.success(`上传头像成功`, 3)
        } else {
          Toast.fail(`上传 ${data.name} 失败！${error}`, 3)
        }
      }
    )
  },
  updateProfileSubmit ({ Meteor, LocalState }, event, form) {
    event.preventDefault()

    form.validateFields((err, values) => {
      if (!err) {
        const userId = Meteor.userId()
        const headimgurl = LocalState.get('headimgurl')
        const { nickname, wechat, email, address } = values

        const profileObj = {
          headimgurl,
          nickname,
          wechat,
          email,
          address
        }

        Meteor.call('users.updateProfile', userId, profileObj, (error, result) => {
          if (!error) {
            Toast.success('更新成功', 3)
            browserHistory.push('/mine')
          } else {
            Toast.fail(`更新失败${error.message}`, 3)
          }
        })
      } else {
        _.values(err).map((obj, i) => {
          if (i === 0) {
            Toast.fail(obj.errors[0].message, 3)
          }
        })
      }
    })
  },
  refund ({ Meteor }, e, order) {
    Meteor.call('transactions.applyRefund', order.id, (err, res) => {
      if (!err) {
        Toast.success('申请退款成功，请等待审核', 3)
      } else {
        Toast.fail(err.message)
      }
    })
  },
  showShareMenu ({ Meteor, wx, LocalState }, e, item) {
    const href = window.location.href
    LocalState.set(`showIconId`, item._id)

    Meteor.call('wechat.signature', href, function (error, result) {
      if (!error) {
        const shareConfig = {
          share: {
            imgUrl: `${window.location.origin}/images/background.png`,
            title: `互动科普`,
            desc: `互动科普邀请你注册为专家`,
            link: `${window.location.origin}/mine/register?code=${item.code}`,
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
      } else {
        console.log(error)
      }
    })
  }
}
