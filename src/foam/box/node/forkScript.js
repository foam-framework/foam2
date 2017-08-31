/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require('path');
var process = require('process');

require(path.resolve(`${__dirname}/../../../foam.js`));

// Attempt to load foam.box.Context from an application module.
var appModule = process.argv.slice(2)[0];
var ctx = null;
if ( appModule ) {
  try {
    var appPath = path.resolve(appModule);
    ctx = require(appPath);
  } catch ( error ) {
    console.warn(`foam.box.node.forkScript: Error resolving and requiring
                      "${appModule}". Exiting.`);
    process.exit(1);
  }
} else {
  console.warn('foam.box.node.forkScript: No application module provided');
}
ctx = ctx || foam.box.Context.create();

// Expected API on "ctx": foam.box.Context.
if ( ! foam.box.Context.isInstance(ctx) ) {
  console.error(`foam.box.node.forkScript: Application module "${appModule}"
                     failed to export a foam.box.Context for IPC. Exiting.`);
  process.exit(1);
}

// Establish socket connection with parent process.
ctx.socketService.listening$.sub(function(sub, _, __, slot) {
  if ( ! slot.get() ) return;

  sub.detach();
  var stdin = require('process').stdin;
  var buf = '';
  stdin.on('data', function(data) {
    buf += data.toString();
  });
  stdin.on('end', function() {
    var parser = foam.box.node.ForkBox.PARSER_FACTORY(ctx.creationContext);
    foam.json.parseString(buf, ctx).send(foam.box.Message.create({
      // TODO(markdittmer): RegisterSelfMessage should handle naming. Is "name:"
      // below necessary?
      object: foam.box.SocketBox.create({
        name: ctx.me.name,
        address: `0.0.0.0:${ctx.socketService.port}`
      })
    }));
  });
});
