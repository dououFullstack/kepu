export default {
  wechat: {
    appId: 'wxe76f447f949e33b3',
    appSecret: '6afaecceb55e4938180261ff69dc150d',
    // appSecret: '03c86eb6d9cf044ddb0496c47fbd3b01',
    mchId: '1443608402',
    partnerKey: 'So6MTvixNs3Uc3toM6CZCGTLEtdbimkb',
    endpoint: 'https://api.weixin.qq.com',
    accessToken: '',
    ticket: '',
    signature: '',
    expires_in: 0,
    timestamp: 0,
    sign_expires_in: 0,
    sign_timestamp: 0
  },
  wechatDev: {
    appId: 'wx63afd8910ac82737',
    appSecret: '06abca4d83a582c46a37957c4c499ba2',
    endpoint: 'https://api.weixin.qq.com'
  },

  // qiniu: {
  //   // 详细设置见七牛云官方网站介绍：https://developer.qiniu.com/kodo/sdk/1289/nodejs
  //   ACCESS_KEY: 'N6R2f18rshVLzSbptBec_a3M9IGmSvDR_KGPxir6',
  //   SECRET_KEY: 'VM-DH1_WTOgl3Ju1MulcHX31j3cMSsLzGaBvz4Jg',
  //   BUCKET_NAME: 'kepu',
  //   DOMAIN_NAME: 'http://owdtj7a36.bkt.clouddn.com/'
  // },
  qiniu: {
    // 详细设置见七牛云官方网站介绍：https://developer.qiniu.com/kodo/sdk/1289/nodejs
    ACCESS_KEY: '0JzzcfCUJB05LUmmgS53FmA_M66SbFC1j99UYTLa',
    SECRET_KEY: 'Z0vdS4Zory2y4lNH5GJbC6gC6wYZ9AF_vfj3q-9I',
    BUCKET_NAME: 'kepustaging',
    DOMAIN_NAME: 'https://kepu.douhs.com/'
  },
  yunpian: {
    APPKEY: '7a11ac9b8eef8bf449df3fe7df2ca06e',
    URL: 'https://sms.yunpian.com/v2/sms/single_send.json'
  }
}
