/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net.node',
  name: 'WebSocketService',
  extends: 'foam.net.web.WebSocketService',

  requires: [
    'foam.net.node.WebSocket',
    'foam.box.HelloMessage'
  ],

  properties: [
    {
      class: 'Int',
      name: 'port',
      value: 4000
    },
    {
      name: 'server'
    },
    {
      name: 'delegate'
    },
    {
      class: 'String',
      name: 'privateKey'
    },
    {
      class: 'String',
      name: 'cert'
    }
  ],

  methods: [
    function init() {
      if ( this.cert && this.privateKey )
        this.server = require('https').createServer({ key: this.privateKey, cert: this.cert });
      else
        this.server = require('http').createServer();

      this.server.on('upgrade', this.onUpgrade);
      this.server.listen(this.port);
    }
  ],

  listeners: [
    function onUpgrade(req, socket, data) {
      var key = req.headers['sec-websocket-key'];
      key += '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

      var hash = require('crypto').createHash('SHA1');
      hash.update(key);
      hash = hash.digest('base64');

      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
          'Upgrade: websocket\r\n' +
          'Connection: upgrade\r\n' +
          'Sec-WebSocket-Accept: ' + hash + '\r\n\r\n');

      var socket = this.WebSocket.create({
        socket: socket
      });
      this.addSocket(socket);
    }
  ]
});
