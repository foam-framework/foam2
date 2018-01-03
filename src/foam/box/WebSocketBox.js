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
    'foam.box.RawWebSocketBox'
  ],

  imports: [
    'webSocketService',
    'me',
    'window'
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
      name: 'delegate',
      factory: function() {
        var ws = this.WebSocket.create({
          uri: this.prepareURL(this.uri),
        });

        return ws.connect().then(function(ws) {

          ws.disconnected.sub(function(sub) {
            sub.detach();
            this.socket = undefined;
          }.bind(this));

          this.webSocketService.addSocket(ws);

          return this.RawWebSocketBox.create({ socket: ws });
        }.bind(this));
      }
    }
  ],

  methods: [
    function prepareURL(url) {
      /* Add window's origin if url is not complete. */
      if ( this.window && url.indexOf(':') == -1 ) {
        var protocol = "ws://";
        if ( this.window.location.protocol === "https:" ) {
          protocol = "wss://";
        }

        return protocol + this.window.location.hostname +
          ( this.window.location.port ? ':' + this.window.location.port : '' ) +
          '/' + url;
      }

      return url;
    },

    {
      name: 'send',
      code: function send(msg) {
        this.delegate.then(function(d) {
          d.send(msg);
        });
      }
    }
  ]
});
