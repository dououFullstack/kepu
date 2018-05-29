# npm install
meteor build --architecture=os.linux.x86_64 .
mv app.tar.gz bundle.tar.gz
# scp ./app.tar.gz root@124.17.28.29:/root/code/
# rm -f app.tar.gz

docker build -t="hub.c.163.com/dou3311/project:kepu517" .
docker push hub.c.163.com/dou3311/project:kepu517

# rm bundle.tar.gz