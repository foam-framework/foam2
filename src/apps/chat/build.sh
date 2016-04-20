#!/bin/sh

set -e

SCRIPT_PATH=${0%/*}
if [ "$SCRIPT_PATH" ] && [ "$SCRIPT_PATH" != ${0} ]; then
    cd $SCRIPT_PATH
fi

cat \
    ../../core/lib.js \
    ../../core/stdlib.js \
    ../../core/events.js \
    ../../core/Context.js \
    ../../core/Boot.js \
    ../../core/Slot.js \
    ../../core/debug.js \
    ../../core/Window.js \
    ../../core/objects.js \
    ../../core/patterns.js \
    ../../core/types.js \
    ../../core/JSON.js \
    ../../core/parse.js \
    ../../core/templates.js \
    ../../core/Action.js \
    ../../core/../lib/Timer.js \
    ../../core/../lib/graphics.js \
    ../../core/../lib/dao.js \
    ../../core/../lib/IDBDAO.js \
    ../../core/../lib/mlang.js \
    ../../core/../lib/Physical.js \
    ../../core/../lib/Collider.js \
    ../../core/../lib/PhysicsEngine.js \
    ../../core/../lib/PhysicalCircle.js \
    ../../core/../lib/utf8.js \
    ../../core/../lib/net.js \
    ../../core/../lib/firebase.js \
    ../../core/../lib/box.js \
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
copy index.html

cd site
firebase deploy
