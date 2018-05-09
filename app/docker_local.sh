docker run  \
  -d \
  --restart=always \
  --link mongodb:mongodb \
  -e MONGO_URL=mongodb://mongodb:27017/kepu \
  -e mongodb_URL=mongodb://mongodb:27017/kepu \
  -e virtual_host=http://kepu.maodou.io \
  -e ROOT_URL=http://kepu.maodou.io \
  -p 4000:80 \
  --name=kepu hub.c.163.com/dou3311/project:kepu0425