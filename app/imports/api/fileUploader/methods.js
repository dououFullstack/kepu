import qiniu from 'qiniu'

export default ({ Meteor, Global }) => {
  const { ACCESS_KEY, SECRET_KEY, BUCKET_NAME } = Global.qiniu

  Meteor.methods({
    'getUploadToken' () {
      const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY)
      const options = {
        scope: BUCKET_NAME
      }
      const putPolicy = new qiniu.rs.PutPolicy(options)
      const uploadToken = putPolicy.uploadToken(mac)

      return uploadToken
    }
  })
}
