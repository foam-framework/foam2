#!/bin/sh
#Concatenate files into one services file
cd ../../
find foam2/src -type f -name cronjobs -exec cat {} \; > cronjobs
find foam2/src -type f -name countries -exec cat {} \; > countries
find foam2/src -type f -name exportDriverRegistrys -exec cat {} \; > exportDriverRegistrys
find foam2/src -type f -name groups -exec cat {} \; > groups
find foam2/src -type f -name languages -exec cat {} \; > languages
find foam2/src -type f -name menus -exec cat {} \; > menus
find foam2/src -type f -name permissions -exec cat {} \; > permissions
find foam2/src -type f -name regions -exec cat {} \; > regions
find foam2/src -type f -name scripts -exec cat {} \; > scripts
find foam2/src -type f -name tests -exec cat {} \; > tests
find foam2/src -type f -name users -exec cat {} \; > users

cd foam2/src
node ../tools/genjava.js ../tools/classes.js ../build/
node ../tools/build.js web
