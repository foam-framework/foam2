#!/bin/sh
#Concatenate files into one services file
SRCDIR=$(dirname $0)
cd "$SRCDIR"
node ../tools/genjava.js ../tools/classes.js ../build/
node ../tools/build.js web
