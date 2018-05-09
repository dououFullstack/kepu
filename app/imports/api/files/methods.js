import Qiniu from 'qiniu'

export default ({ Meteor, Collections, Global, Random, check }) => {
  const { ACCESS_KEY, SECRET_KEY, BUCKET_NAME } = Global.qiniu

  const config = new Qiniu.conf.Config()
  config.zone = Qiniu.zone.Zone_z2
  const formUploader = new Qiniu.form_up.FormUploader()
  const syncQiniuIoPut = Meteor.wrapAsync(formUploader.put, formUploader)

  // Upload binary file
  const uploadFile = (buf, key) => {
    const putPolicy = new Qiniu.rs.PutPolicy({ scope: BUCKET_NAME })
    const mac = new Qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY)
    const uptoken = putPolicy.uploadToken(mac)
    const extra = new Qiniu.form_up.PutExtra()
    let result
    try {
      result = syncQiniuIoPut(uptoken, key, buf, extra)
    } catch (e) {
      throw Meteor.Error('400', e.message)
    }
    return result
  }

  Meteor.methods({
    /**
     * files.uploadFile 上传文件到七牛云
     * @param {*} buf 文件的 buf，由前端传入
     * @param {*} type 文件的类型，image、audio、pdf、word 等
     * @param {*} extension 文件的后缀名
     */
    'files.uploadFile' (buf, type, extension) {
      check(buf, String)
      check(type, String)
      check(extension, String)

      if (!Meteor.userId()) {
        throw new Meteor.Error('401', '请登录后重试！')
      }

      const fileName = Meteor.isDevelopment
      ? `dev/${Random.hexString(8)}.${extension}`
      : `${Random.hexString(8)}.${extension}`

      const regex = new RegExp(`^data:.*${type}.*;base64,`)

      const res = uploadFile(new Buffer(buf.replace(regex, ''), 'base64'), fileName)
      return res.key
    }
  })
}
