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
  package: 'foam.net.node',
  name: 'WebSocket',
  flags: ['node'],
  requires: [
    'foam.json.Outputter',
    'foam.net.node.Frame'
  ],

  topics: [
    'message',
    'connected',
    'disconnected'
  ],

  properties: [
    {
      name: 'socket',
      postSet: function(old, s) {
        if ( old ) {
          old.removeListener('data', this.onData);
          old.removeListener('close', this.onClose);
        }
        if ( s ) {
          s.on('data', this.onData);
          s.on('close', this.onClose);
        }
      }
    },
    'opcode',
    'parts',
    'currentFrame',
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      factory: function() {
        return this.Outputter.create({
          pretty: false,
          formatDatesAsNumbers: true,
          outputDefaultValues: false,
          strict: true,
          propertyPredicate: function(o, p) { return ! p.networkTransient; }
        });
      }
    }
  ],

  methods: [
    function send(data) {
      if ( foam.box.Message.isInstance(data) ) {
        data = this.outputter.stringify(data);
      }

      if ( typeof data == "string" ) {
        var opcode = 1;
        data = Buffer.from(data);
      } else {
        opcode = 2;
      }

      var frame = this.Frame.create({
        fin: 1,
        buffer: data,
        opcode: opcode
      });
      this.socket.write(frame.toData());
    },

    function close() {
      this.socket.end();
    }
  ],

  listeners: [
    {
      name: 'onClose',
      code: function() {
        this.disconnected.pub();
      }
    },
    {
      name: 'onFrame',
      code: function(frame) {
        if ( frame.opcode & 0x8 ) {
          if ( frame.opcode == 8 ) {
            var resp = this.Frame.create({
              fin: 1,
              buffer: frame.buffer.slice(0, 2),
              opcode: 8
            });
            this.socket.end(resp.toData());
          } else if ( frame.opcode == 9 ) {
            var resp = this.Frame.create({
              fin: 1,
              buffer: frame.buffer,
              opcode: 10
            });
            var written = this.socket.write(resp.toData());
          }
          return;
        }

        if ( frame.opcode == 1 || frame.opcode == 2) {
          this.parts = [frame.buffer];
          this.opcode = frame.opcode;
        } else if ( frame.opcode == 0 ) {
          this.parts.push(frame.buffer);
        }

        if ( frame.fin ) {
          var msg = Buffer.concat(this.parts);
          if ( this.opcode == 1 ) {
            msg = msg.toString();
          }
          this.message.pub(msg);
        }
      }
    },
    {
      name: 'onData',
      code: function(data) {
        var i = 0;
        while ( i < data.length ) {
          if ( ! this.currentFrame ) {
            this.currentFrame = this.Frame.create();
          }

          i = this.currentFrame.onData(data, i);
          if ( this.currentFrame.finished ) {
            var f = this.currentFrame;
            this.currentFrame = null;
            this.onFrame(f);
          }
        }
      }
    }
  ]
});
