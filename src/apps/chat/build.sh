#!/bin/sh

set -e

SCRIPT_PATH=${0%/*}
if [ "$SCRIPT_PATH" ] && [ "$SCRIPT_PATH" != ${0} ]; then
    cd $SCRIPT_PATH
fi

cat \
    ../../core/poly.js \
    ../../core/lib.js \
    ../../core/stdlib.js \
    ../../core/events.js \
    ../../core/Context.js \
    ../../core/AbstractClass.js \
    ../../core/Boot.js \
    ../../core/FObject.js \
    ../../core/Model.js \
    ../../core/Property.js \
    ../../core/Method.js \
    ../../core/Boolean.js \
    ../../core/AxiomArray.js \
    ../../core/EndBoot.js \
    ../../core/FObjectArray.js \
    ../../core/Constant.js \
    ../../core/types.js \
    ../../core/Topic.js \
    ../../core/InnerClass.js \
    ../../core/Implements.js \
    ../../core/ImportsExports.js \
    ../../core/Listener.js \
    ../../core/IDSupport.js \
    ../../core/Requires.js \
    ../../core/Slot.js \
    ../../core/Proxy.js \
    ../../core/Promised.js \
    ../../core/Enum.js \
    ../../core/Window.js \
    ../../core/debug.js \
    ../../core/patterns.js \
    ../../core/JSON.js \
    ../../core/parse.js \
    ../../core/templates.js \
    ../../core/Action.js \
    ../../core/../lib/Promise.js \
    ../../core/../lib/Timer.js \
    ../../core/../lib/graphics.js \
    ../../core/../lib/dao.js \
    ../../core/../lib/mlang.js \
    ../../core/../lib/AATree.js \
    ../../core/../lib/Index.js \
    ../../core/../lib/MDAO.js \
    ../../core/../lib/TimestampDAO.js \
    ../../core/../lib/JournalDAO.js \
    ../../core/../lib/IDBDAO.js \
    ../../core/../lib/Pooled.js \
    ../../core/../lib/QueryParser.js \
    ../../core/../lib/Physical.js \
    ../../core/../lib/Collider.js \
    ../../core/../lib/PhysicsEngine.js \
    ../../core/../lib/PhysicalCircle.js \
    ../../core/../lib/utf8.js \
    ../../core/../lib/net.js \
    ../../core/../lib/messageport.js \
    ../../core/../lib/firebase.js \
    ../../core/../lib/fcm.js \
    ../../core/../lib/Stub.js \
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
copy manifest.json
copy index.html

cd site
firebase deploy
