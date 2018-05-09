import React from 'react'
import Form from 'antd/lib/form'
import InputNumber from 'antd/lib/input-number'
import Button from 'antd/lib/button'
import Collapse from 'antd/lib/collapse'
import { compose, merge } from 'react-komposer'
import { useDeps } from 'react-simple-di'
import getTrackerLoader from '/imports/api/getTrackerLoader'

const FormItem = Form.Item
const Panel = Collapse.Panel

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden'
}

const GlobalSettings = ({ globalSettings, form, globalSettingsSubmit }) => {
  const { getFieldDecorator } = form

  return (
    <div id='admin-global-settings'>
      <Collapse bordered={false} defaultActiveKey={['1']}>
        <Panel header='全局属性设置' key='1' style={customPanelStyle}>
          <Form layout='inline' onSubmit={(e) => globalSettingsSubmit(e, form)}>
            <FormItem
              label='发布问题自动上线时间'
            >
              {getFieldDecorator('showTime', {
                initialValue: globalSettings && globalSettings.value
              })(
                <InputNumber min={0.1} max={10} />
              )}
              <span className='ant-form-text' style={{ fontSize: '12px' }}> 小时</span>
            </FormItem>
            <FormItem>
              <Button type='primary' htmlType='submit'>
                提交
              </Button>
            </FormItem>
          </Form>
        </Panel>
      </Collapse>
    </div>
  )
}

const reactiveMapper = ({context}, onData) => {
  const { Meteor, Collections } = context
  const { GlobalSettings } = Collections
  if (Meteor.subscribe('globalSettings.all').ready()) {
    const globalSettings = GlobalSettings.findOne({key: 'showTime'})
    onData(null, { globalSettings })
  } else {
    onData(null, {})
  }
}

const depsToProps = (context, actions) => ({
  context,
  globalSettingsSubmit: actions.admin.globalSettingsSubmit
})

export default merge(
  compose(getTrackerLoader(reactiveMapper)),
  useDeps(depsToProps)
)(Form.create()(GlobalSettings))
