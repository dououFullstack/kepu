import userAccountConfigs from '/imports/api/users/account-configs'
import userMethods from '/imports/api/users/methods'

import activitiesMethods from '/imports/api/activities/methods'
import enrollmentsMethods from '/imports/api/enrollments/methods'
import videosMethods from '/imports/api/videos/methods'
import questionsMethods from '/imports/api/questions/methods'
import answersMethods from '/imports/api/answers/methods'
import wechatMethods from '/imports/api/wechat/methods'
import filesMethods from '/imports/api/files/methods'
import messagesMethods from '/imports/api/messages/methods'
import inviteCodesMethods from '/imports/api/inviteCodes/methods'
import transactionsMethods from '/imports/api/transactions/methods'
import globalSettingsMethods from '/imports/api/globalSettings/methods'
import fileUploader from '/imports/api/fileUploader/methods'

import activitiesPublications from '/imports/api/activities/publications'
import enrollmentsPublications from '/imports/api/enrollments/publications'
import videosPublications from '/imports/api/videos/publications'
import questionsPublications from '/imports/api/questions/publications'
import answersPublications from '/imports/api/answers/publications'
import usersPublications from '/imports/api/users/publications'
import transactionsPublications from '/imports/api/transactions/publications'
import inviteCodesPublications from '/imports/api/inviteCodes/publications'
import globalSettingsPublications from '/imports/api/globalSettings/publications'
import wechatRest from '/imports/api/wechat/rest'

const APIs = [
  userAccountConfigs,
  activitiesMethods,
  enrollmentsMethods,
  videosMethods,
  userMethods,
  questionsMethods,
  answersMethods,
  filesMethods,
  messagesMethods,
  inviteCodesMethods,
  transactionsMethods,
  globalSettingsMethods,
  activitiesPublications,
  enrollmentsPublications,
  videosPublications,
  questionsPublications,
  answersPublications,
  wechatMethods,
  wechatRest,
  usersPublications,
  transactionsPublications,
  inviteCodesPublications,
  globalSettingsPublications,
  fileUploader
]

export default (context) => {
  APIs.map((api) => api(context))
}
