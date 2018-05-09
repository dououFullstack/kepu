import { Meteor } from 'meteor/meteor'
import { browserHistory } from 'react-router'
import React from 'react'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import message from 'antd/lib/message'
const FormItem = Form.Item

class LoginForm extends React.Component {
  constructor () {
    super()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { username, password } = values
        Meteor.loginWithPassword(username, password, (error, result) => {
          if (error) {
            message.error('您所输入的用户名或密码不正确,请重新填写')
            console.log('loginWithPassword fail:', error)
          } else {
            console.log('loginWithPassword success:', result)
            browserHistory.push('/admin/users')
          }
        })
      }
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    return (
      <div className='login'>
        <Form onSubmit={this.handleSubmit} className='login-form'>
          <h1>请使用管理员登录</h1>
          <FormItem>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: '请填写用户名' }]
            })(
              <Input
                prefix={<Icon type='user' style={{ fontSize: 13 }} />}
                placeholder='用户名'
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请填写密码' }]
            })(
              <Input
                prefix={<Icon type='lock' style={{ fontSize: 13 }} />}
                type='password'
                placeholder='密码'
              />
            )}
          </FormItem>
          <FormItem>
            <Button
              type='primary'
              htmlType='submit'
              className='login-form-button'
            >
              登录
            </Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}

export default Form.create()(LoginForm)
