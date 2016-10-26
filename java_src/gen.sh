#!/bin/sh

node ../tools/genjava.js .

node ../tools/build.js web

mkdir -p WEB-INF/resources

cp ../src/files.js WEB-INF/resources
cp ../src/foam.js WEB-INF/resources
cp -r ../src/foam WEB-INF/resources
cp -r ../src/com WEB-INF/resources
