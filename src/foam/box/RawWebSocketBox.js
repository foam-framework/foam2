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

foam.CLASS({
  package: 'foam.box',
  name: 'RawWebSocketBox',
  implements: ['foam.box.Box'],
  requires: [
    'foam.json.Outputter'
  ],

  properties: [
    {
      class: 'Object',
      name: 'socket',
      javaType: 'org.java_websocket.WebSocket'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        var replyBox = msg.attributes.replyBox;
        if ( replyBox ) {
          // TODO: We should probably clone here, but often the message
          // contains RPC arguments that don't clone properly.  So
          // instead we will mutate replyBox and put it back after.

          // Even better solution would be to move replyBox to a
          // property on Message and have custom serialization in it to
          // do the registration.
          msg.attributes.replyBox =
            this.__context__.registry.register(null, null, msg.attributes.replyBox);
        }

        var payload = this.Outputter.create().copyFrom(foam.json.Network).stringify(msg);

        if ( replyBox ) {
          msg.attributes.replyBox = replyBox;
        }

        try {
          this.socket.send(payload);
        } catch(e) {
          replyBox && replyBox.send(foam.box.Message.create({ object: e }));
        }
      },
      javaCode: `
foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(foam.lib.json.OutputterMode.NETWORK);
outputter.setX(getX());
getSocket().send(outputter.stringify(message));
`
    }
  ]
});
