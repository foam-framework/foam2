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
  name: 'SocketService',
  flags: ['node'],
  requires: [
    'foam.box.Message',
    'foam.box.RawSocketBox',
    'foam.box.RegisterSelfMessage',
    'foam.json.Parser',
    'foam.net.node.Socket'
  ],

  imports: [
    'creationContext',
    'error',
    'info'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'listen',
      value: true
    },
    {
      class: 'Boolean',
      name: 'listening'
    },
    {
      class: 'Int',
      name: 'port',
      value: 7000
    },
    {
      name: 'server'
    },
    {
      name: 'delegate'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Parser',
      name: 'parser',
      factory: function() {
        return this.Parser.create({
          strict: true,
          creationContext: this.creationContext
        });
      }
    }
  ],

  methods: [
    function init() {
      if ( ! this.listen ) return;

      this.setupServer(this.port);
    },

    function setupServer(port) {
      var server = this.server = new require('net').Server();
      this.server.on('connection', this.onConnection);
      this.server.on('error', function(error) {
        this.error('foam.net.node.SocketService: Server error', error);
        server.unref();
        if ( error.code === 'EADDRINUSE' ) {
          var port = Math.floor( 10000 + ( Math.random() * 10000 ) );
          this.info('foam.net.node.SocketService: Retrying on port', port);
          this.setupServer(port);
        }
      }.bind(this));

      if ( this.listen ) {
        this.server.on('listening', function() {
          this.listening = true;
        }.bind(this));
        this.server.listen(this.port = port);
      }
    },

    function addSocket(socket) {
      var socketBox = this.RawSocketBox.create({
        socket: socket
      })
      var X = this.creationContext.createSubContext({
        returnBox: socketBox,
      });

      var s1 = socket.message.sub(function(s, _, mStr) {
        var m = this.parser.parseString(mStr, X);

        if ( ! this.Message.isInstance(m) ) {
          console.warn('Got non-message:', m, mStr);
        }

        if ( this.RegisterSelfMessage.isInstance(m) ) {
          var named = foam.box.NamedBox.create({
            name: m.name
          });

          named.delegate = socketBox;
          return;
        }

        this.delegate && this.delegate.send(m);
      }.bind(this));

      socket.disconnect.sub(function() {
        s1.detach();
      }.bind(this));
    }
  ],

  listeners: [
    {
      name: 'onConnection',
      code: function(socket) {
        socket = this.Socket.create({ socket_: socket });
        this.addSocket(socket);
      }
    }
  ]
});
