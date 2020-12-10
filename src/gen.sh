#!/bin/sh
#Concatenate files into one services file
SRCDIR=$(dirname $0)
cd "$SRCDIR"

CLEAN_BUILD=0

print_usage() {
  printf " -c: to have a fresh build\n"
  printf " -h: print help\n"
}

while getopts 'ch' flag; do
  case "${flag}" in
    c) CLEAN_BUILD=1 ;;
    h) print_usage
       exit 1 ;;
  esac
done

if [ ${CLEAN_BUILD} -eq 1 ]; then
  # Delete old build files
  rm -r ../build/
fi

node ../tools/genjava.js ../tools/classes.js ../build/
node ../tools/build.js web
