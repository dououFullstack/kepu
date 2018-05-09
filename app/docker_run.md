### Docker打包
运行
```bash
build.sh
```

### Docker运行
启动脚本：

```bash
docker run \
    -d \
    --restart=always \
    -e VIRTUAL_HOST=kepu.maodou.io \
    -e LETSENCRYPT_HOST=kepu.maodou.io \
    -e LETSENCRYPT_EMAIL=dev@maodou.io \
    -e mongodb_URL=mongodb://kepu:2OJYsGoifThKetjp@rs-01.mongodb.maodou.io:27017,rs-02.mongodb.maodou.io:27017,rs-03.mongodb.maodou.io:27017/kepu-test?replicaSet=Maodou_RS \
    -e MONGO_URL=mongodb://kepu:2OJYsGoifThKetjp@rs-01.mongodb.maodou.io:27017,rs-02.mongodb.maodou.io:27017,rs-03.mongodb.maodou.io:27017/kepu-test?replicaSet=Maodou_RS \
    -e virtual_host=http://kepu.maodou.io \
    -e ROOT_URL=http://kepu.maodou.io \
    -e MAIL_URL=smtp://dev@maodou.io:Maodou2015@smtp.exmail.qq.com:465 \
    -p 4000:80 \
    --name=kepu \
    registry.cn-beijing.aliyuncs.com/maodouio/kepu:dev
```

在本地运行
```bash
docker run \
    -d \
    --restart=always \
    -e VIRTUAL_HOST=kepu.maodou.io \
    -e LETSENCRYPT_HOST=kepu.maodou.io \
    -e LETSENCRYPT_EMAIL=dev@maodou.io \
    --link mongodb:mongodb \
    -e MONGO_URL=mongodb://mongodb:27017/kepu \
    -e mongodb_URL=mongodb://mongodb:27017/kepu \
    -e virtual_host=http://kepu.maodou.io \
    -e ROOT_URL=http://kepu.maodou.io \
    -e MAIL_URL=smtp://dev@maodou.io:Maodou2015@smtp.exmail.qq.com:465 \
    -p 4000:80 \
    --name=kepu \
    registry.cn-beijing.aliyuncs.com/maodouio/kepu:dev
```

### Docker image打包与解压缩(用于离线状态)
打包：
```
docker save registry.cn-beijing.aliyuncs.com/maodouio/kepu:dev | bzip2 -9 -c > kepu-img.tar.bz2
```

解包：
```
bzip2 -d -c < kepu-img.tar.bz2 | docker load
```

**说明**
- VIRTUAL_HOST，LETSENCRYPT_HOST，LETSENCRYPT_EMAIL这三项，是用于letsencript证书的，如果不使用可以去掉
- mongodb_URL，MONGO_URL由于历史原因，这两项是mongo的url，内容一样的
- virtual_host用于nginx的反向代理，如果不需要可以去掉
- ROOT_URL必须设置
- -p 4000:80，其中4000是需要暴露的端口号，可以根据需要改动。80不要改
