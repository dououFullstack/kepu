import { json } from 'd3-request'

export default ({ Collections, Meteor, Accounts, Roles }) => {
  const { Activities, Enrollments, Questions, Answers, Users, Videos, GlobalSettings, Transactions } = Collections

  // 移除数据
  // Users.remove({})
  // Activities.remove({})
  // Questions.remove({})
  // Videos.remove({})
  // Transactions.remove({})

  // 初始化默认设置
  const defaultShowTime = GlobalSettings.findOne({
    key: 'showTime'
  })
  if (!defaultShowTime) {
    GlobalSettings.insert({
      key: 'showTime',
      value: '1'
    })
  }

  // 创建默认的管理员账户
  const adminEmail = 'admin@example.com'
  if (!Users.findOne({ 'emails.0.address': adminEmail, roles: { $elemMatch: { $eq: 'admin' } } })) {
    const adminId = Accounts.createUser({
      username: 'Admin',
      password: 'kepu2017',
      profile: {
        nickname: '管理员',
        sex: 1
      }
    })
    Accounts.addEmail(adminId, adminEmail)
    Roles.addUsersToRoles(adminId, ['admin'])

    for (let i = 0; i < 30; i++) {
      Accounts.createUser({
        username: `Admin${i}`,
        password: 'kepu2017',
        profile: {
          nickname: 'TestUser',
          sex: 1
        }
      })
    }
  }

  if (Activities.find({}).count() === 0) {
    // 从聚合数据请求一部分测试数据
    const key = '9ac9a526985bbd20fa150784f4ed7249'
    const nbaKey = 'cdc9d64b61d5c7aa052c806f9d21693f'
    const url = 'http://v.juhe.cn/toutiao/index?type=&key=' + key
    const nbaURL = 'http://v.juhe.cn/nba/all_team_info.php?key=' + nbaKey

    json(nbaURL, Meteor.bindEnvironment((err, nbaData) => {
      if (!err) {
        const result = nbaData.result

        json(url, Meteor.bindEnvironment((error, data) => {
          if (!error) {
            const dataSource = data.result.data
            const user = Users.findOne()
            dataSource.map((d, i) => {
              const activityId = Activities.insert({
                title: d.title,
                content: d.url,
                notice: '此为生成的测试数据',
                address: '798 艺术区',
                defaultImage: {
                  uid: d.thumbnail_pic_s,
                  name: d.title,
                  url: d.thumbnail_pic_s,
                  status: 'done'
                },
                beginTime: new Date(),
                endTime: new Date(),
                charge: i % 2 ? 100 : 0,
                refund: i % 2 ? Boolean(true) : Boolean(false),
                attachments: [],
                telephone: '13520322335'
              })

              Object.keys(result).map((item, idx) => {
                Enrollments.insert({
                  activityId: activityId,
                  status: 0,
                  userId: user._id,
                  username: result[item].eng_full_name,
                  gender: idx % 2 ? '男' : '女',
                  IDCardType: idx % 2 ? '军官证' : '身份证',
                  IDCardNumber: result[item].tagid,
                  telephone: result[item].statsid,
                  email: `${result[item].statsid}@gmail.com`
                })
              })
            })
          } else {
            console.log(error)
          }
        }))
      }
    }))
  }

  if (Questions.find({}).count() < 10) {
    const key = '4a708c2cd6cd4d33a14554018adf15bf'
    const keywork = encodeURIComponent('印度')
    const url = `http://api.avatardata.cn/ActNews/Query?key=${key}&keyword=${keywork}`

    json(url, Meteor.bindEnvironment((error, data) => {
      if (!error) {
        if (!data.result) return
        const dataSource = data.result
        const user = Users.findOne()
        const showTime = new Date()
        const time = GlobalSettings.findOne({ key: 'showTime' })
        showTime.setHours(showTime.getHours() + +time.value)
        dataSource.map((d, i) => {
          const questionId = Questions.insert({
            title: d.full_title,
            content: d.content,
            userId: user._id,
            author: user.profile.nickname,
            avatar: user.profile.headimgurl,
            showTime: showTime
          })

          for (let j = 0; j < 10; j++) {
            Answers.insert({
              questionId: questionId,
              userId: user._id,
              content: '这是一条测试评论。长度要超过三行，让我们可以判断前端 UI 是否显示正常，这样才能判断我们的代码是否有问题。',
              avatar: user.profile.headimgurl,
              author: user.profile.nickname
            })

            Questions.update(questionId, {
              $inc: { answerTotal: 1 }
            })
          }
        })
      } else {
        console.log(error)
      }
    }))
  }

  if (Videos.find({}).count() === 0) {
    const key = '9ac9a526985bbd20fa150784f4ed7249'
    const url = `http://v.juhe.cn/toutiao/index?type=&key=${key}`

    json(url, Meteor.bindEnvironment((error, data) => {
      if (!error) {
        const dataSource = data.result.data

        dataSource.map((d, i) => {
          Videos.insert({
            title: d.title,
            content: d.url,
            isVisible: true,
            defaultImage: { url: d.thumbnail_pic_s || 'http://owdtj7a36.bkt.clouddn.com/673d72ae.jpg' },
            defaultVideo: { url: 'http://owdtj7a36.bkt.clouddn.com/dev/446dca3f.mov' },
            charge: Number(0.01)
          })
        })
      }
    }))
  }
}
