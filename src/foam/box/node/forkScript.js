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

require(require('path').resolve(`${__dirname}/../../../foam.js`));

var ctx = foam.box.Context.create();

ctx.socketService.listening$.sub(function(sub, _, __, slot) {
  if ( ! slot.get() ) return;

  sub.detach();
  var stdin = require('process').stdin;
  var buf = '';
  stdin.on('data', function(data) {
    buf += data.toString();
  });
  stdin.on('end', function() {
    // TODO(markdittmer): Use secure parser.
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
