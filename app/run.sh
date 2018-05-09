#!/bin/bash
npm install
MONGO_URL=mongodb://127.0.0.1:27017/doudou \
ROOT_URL=http://localhost:3100 \
meteor run --production -p 3100