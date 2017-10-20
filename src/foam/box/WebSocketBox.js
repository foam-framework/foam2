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
  name: 'WebSocketBox',

  requires: [
    'foam.net.web.WebSocket',
    'foam.box.Message',
    'foam.box.RegisterSelfMessage'
  ],

  imports: [
    'webSocketService',
    'me',
    'window'
  ],

  classes: [
    {
      name: 'JSONOutputter',
      extends: 'foam.json.Outputter',
      requires: [
        'foam.box.ReturnBox'
      ],
      imports: [
        'me'
      ],
      methods: [
        function output(o) {
          if ( o === this.me ) {
            return this.SUPER(this.ReturnBox.create());
          }
          return this.SUPER(o);
        }
      ]
    }
  ],

  axioms: [
    foam.pattern.Multiton.create({
      property: 'uri'
    })
  ],

  properties: [
    {
      name: 'uri',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      generateJava: false,
      factory: function() {
        return this.JSONOutputter.create().copyFrom(foam.json.Network);
      }
    },
    {
      name: 'socket',
      factory: function() {
        var ws = this.WebSocket.create({
          uri: this.prepareURL(this.uri),
        });

        return ws.connect().then(function(ws) {

          ws.disconnected.sub(function(sub) {
            sub.detach();
            this.socket = undefined;
          }.bind(this));

          ws.send(this.Message.create({
            object: this.RegisterSelfMessage.create({ name: this.me.name })
          }));

          this.webSocketService.addSocket(ws);

          return ws;
        }.bind(this));
      }
    }
  ],

  methods: [
    function prepareURL(url) {
      /* Add window's origin if url is not complete. */
      if ( this.window && url.indexOf(':') == -1 ) {
        return 'ws://' + this.window.location.hostname + ':' + ( Number.parseInt(this.window.location.port) + 1 ) + '/' + url;
      }

      return url;
    },

    function send(msg) {
      var replyBox = msg.attributes.replyBox;
      if ( replyBox ) {
        msg = msg.clone();

        msg.attributes.replyBox =
          this.__context__.registry.register(null, null, msg.attributes.replyBox);
      }

      this.socket.then(function(s) {
        s.send(this.outputter.stringify(msg));
      }.bind(this), function(e) {
        replyBox && replyBox.send(foam.box.Message.create({ object: e }));
      });
    }
  ]
});
