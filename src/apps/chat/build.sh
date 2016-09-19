#!/bin/sh

set -e

SCRIPT_PATH=${0%/*}
if [ "$SCRIPT_PATH" ] && [ "$SCRIPT_PATH" != ${0} ]; then
    cd $SCRIPT_PATH
fi

node ../../../tools/build.js

cat ../../../foam-bin.js \
    chat.js \
    > site/public/foam.js

function copy () {
    cp $1 site/public/
}

copy client.js
copy sw.js
copy worker.js
copy sharedWorker.js
copy style.css
copy manifest.json
copy index.html

cd site
firebase deploy
