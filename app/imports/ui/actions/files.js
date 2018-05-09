/**
 * uploadFile 调用后台方法上传文件，并与前台交互
 * @param {String} itemName 上传文件的唯一特征标识，用来判断文件是否上传中等状态
 * @param {String} itemDesc 上传文件的描述，如果成功或者失败，用来显示在提示框中的文字
 * @param {String} type 上传的文件类型，如 image，必须在第二个参数数据中存在
 * @param {Object} event 上传控件的 event
 * @param {Object} Meteor 全局的 Meteor 对象
 */
const UploadFile = (itemName, itemDesc, type, file, Meteor, callback) => {
  // 开始上传文件
  const fileReader = new FileReader()
  fileReader.readAsDataURL(file)
  fileReader.onloadend = () => {
    let data = { uid: itemName, name: itemDesc }
    const dataString = fileReader.result
    // 调用后台的上传方法
    Meteor.call('files.uploadFile', dataString, type, file.name.split('.').pop(), (err, res) => {
      // 上传完成后，设置当前被上传文件的状态为非上传状态，UI 端根据这个状态判断是否在上传中
      if (err) {
        data.status = 'loading'
        data.url = ''
        callback(data, `上传${data.name}失败，${err.reason || err.message}`)
      } else {
        data.status = 'done'
        data.url = res
        callback(data)
      }
    })
  }
}

export default UploadFile
