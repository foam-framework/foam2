#!/bin/sh

node ../tools/genjava.js ../tools/classes.js .

node ../tools/build.js web
