#!/bin/sh

node ../tools/genjava.js ../tools/classes.js ../java_src

node ../tools/build.js web
