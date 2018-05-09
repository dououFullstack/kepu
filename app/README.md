## 互动科普

### 运行项目

克隆项目
```
git cloen https://github.com/limingth/kepu.git
```

安装依赖
```
cd kepu/app
yarn install
// or
npm install
```

运行项目
```
./bin/kepu.sh
```

新开一个终端，运行 ngrok 客户端连接服务器做映射
```
./bin/start.sh
```

### 微信调试说明

由于项目部署后是 docker 容器环境，不利于调试，所以我们需要临时使用一台外网服务器来做数据转发服务。目前 wxpay.mycode.net.cn 指向的服务器架设了 ngrok server，可提供数据转发服务，我们仅需通过客户端连接上 ngrok 服务器以后即可实现在线调试微信支付、微信登录等功能。除非程序崩溃，ngrok server 在服务器是长期运行的，所以随时可以连接。连接成功后访问 [http://wxpay.mycode.net.cn](http://wxpay.mycode.net.cn) 即可。

如不需要对微信登录或微信支付进行开发和测试，可以临时屏蔽 `imports/ui/components/layouts/mainLayout/index.js` 中 `Meteor.loginWithWeChatMP` 相关代码。

### 参数详细说明

`ROOT_URL=http://wxpay.mycode.net.cn` 是为了 Meteor 项目运行起来后 accounts-wechat-mp 的包可以获取我们的回调地址，当我们设置为 `http://wxpay.mycode.net.cn` 时，微信登录回调地址就是该地址。需要注意的是，项目 `/imports/startup/client/global.js` 和 `/imports/startup/server/global.js` 中设置的 appId 和 appSecret 要与实际公众号一致。公众号授权回调域名也需要设置为以上域名。

`meteor --port 8000` 是为了让项目运行在 8000 端口，ngrok 客户端转发数据时会指定转发到该端口，当然也可以自己修改，修改运行端口后，ngrok 命令后面的端口也要修改为一样的（在 /bin/start.sh 中）。
