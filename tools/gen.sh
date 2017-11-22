#!/bin/sh

node ../tools/genjava.js ../tools/classes.js ../build/
node ../tools/build.js web
