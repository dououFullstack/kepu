import _ from 'lodash'

export const hasPermission = (rule, roles) =>
  _.intersection(rule, roles).length > 0

// admin 管理员
// expert 专家
// user 普通用户

export const ADMIN = ['admin']
export const EXPERT = ['expert']
export const FRONTADMIN = ['frontAdmin']
export const USER = ['user']

export const DO_REPLY_QUESTION = ['admin', 'expert']
