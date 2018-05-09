# npm install
# meteor build --architecture=os.linux.x86_64 .
# mv app.tar.gz bundle.tar.gz

docker build -t="hub.c.163.com/dou3311/project:kepu0425" .
docker push hub.c.163.com/dou3311/project:kepu0425

# rm bundle.tar.gz