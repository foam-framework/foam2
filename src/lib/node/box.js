/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.net',
  name: 'SocketService',
  requires: [
    'foam.net.Socket'
  ],
  properties: [
    {
      class: 'Map',
      name: 'sockets'
    },
    {
      class: 'Boolean',
      name: 'listen',
      value: true
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      name: 'server',
    }
  ],
  exports: [
    'as socketService'
  ],
  methods: [
    function init() {
      if ( ! this.listen ) return;

      var server = this.server = new require('net').Server();
//      this.server.ref();
      this.server.on('connection', this.onConnection);
      this.server.on('error', function() {
        console.log("error");
        server.unref();
      }.bind(this));
      this.server.listen(this.port);
    },
    function getSocket(host, port) {
      port = port || this.port;

      var resolve;
      var reject;
      var p = new Promise(function(r, j) { resolve = r; reject = j; });

      require('dns').lookup(host, function(host) {
        var key = host;
        if ( this.sockets[key] ) {
          resolve(this.sockets[key]);
          return;
        }

        resolve(new Promise(function(resolve, reject) {
          var socket = new require('net').Socket();
          socket.once('error', function(e) {
            reject(e);
          });
          socket.once('connect', function() {
            var s = this.Socket.create({
              socket_: socket
            });
            this.addSocket(s);
            resolve(s);
          }.bind(this));
          socket.connect(port, host);
        }.bind(this)));
      }.bind(this));

      return p;
    },
    function addSocket(socket) {
      var key = socket.remoteAddress;
      this.sockets[key] = socket;
      socket.message.sub(this.onMessage);
      socket.disconnect.sub(function() {
        this.removeSocket(socket);
      }.bind(this));
    },
    function removeSocket(socket) {
      socket.message.unsub(this.onMessage);
    }
  ],
  topics: [
    'message'
  ],
  listeners: [
    {
      name: 'onMessage',
      code: function(s, _, m) {
        this.message.pub(m);
      },
    },
    {
      name: 'onConnection',
      code: function(socket) {
        socket = this.Socket.create({ socket_: socket });
        this.addSocket(socket);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.net',
  name: 'Socket',
  properties: [
    {
      name: 'remoteAddress'
    },
    {
      name: 'socket_',
      postSet: function(o, s) {
        if ( o ) {
          o.removeListener('data', this.onData);
          o.removeListener('close', this.onClose);
          o.removeListener('error', this.onError);
        }
        if ( s ) {
          this.remoteAddress = s.remoteAddress;
          s.on('data', this.onData);
          s.on('close', this.onClose);
          s.on('error', this.onError);
        }
      }
    },
    {
      class: 'Int',
      name: 'offset',
      value: 0
    },
    {
      name: 'buffer'
    },
    {
      class: 'Int',
      name: 'nextSize',
      value: 0
    }
  ],
  topics: [
    'message',
    'disconnect',
    'connect'
  ],
  methods: [
    function write(msg) {
      var serialized = foam.json.stringify(msg);
      var size = Buffer.byteLength(serialized);
      var packet = new Buffer(size + 4);
      packet.writeInt32LE(size);
      packet.write(serialized, 4);
      this.socket_.write(packet);
    },
    function onMessage() {
      var data = this.buffer.toString();
      var obj = foam.json.parse(foam.json.parseString(data));
      this.message.pub(obj);
    }
  ],
  listeners: [
    {
      name: 'onData',
      code: function(data) {
        var start = 0;
        var end = data.length;
        var length = data.length;
        var remaining = this.nextSize - this.offset;

        while ( start != data.length ) {
          if ( this.nextSize == 0 ) {
            this.nextSize = data.readInt32LE(start);
            this.buffer = new Buffer(this.nextSize);
            this.offset = 0;
            remaining = this.nextSize - this.offset;
            start += 4;
          }


          var written = data.copy(this.buffer,
                                  this.offset,
                                  start,
                                  Math.min(remaining + start, end));

          start += written;
          this.offset += written;

          if ( this.offset == this.nextSize ) {
            this.onMessage();
            this.nextSize = 0;
          }
        }
      }
    },
    {
      name: 'onClose',
      code: function() {
        this.disconnect.pub();
      }
    },
    {
      name: 'onError',
      code: function() {
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'SocketServer',
  imports: [
    'socketService'
  ],
  properties: [
    {
      name: 'delegate'
    }
  ],
  methods: [
    function init() {
      this.socketService.message.sub(this.onMessage);
    }
  ],
  listeners: [
    {
      name: 'onMessage',
      code: function(s, _, msg) {
        this.delegate.send(msg);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.net.node',
  name: 'WebSocket',
  requires: [
    'foam.net.node.Frame'
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
    'currentFrame'
  ],
  topics: [
    'message',
    'connected',
    'disconnected'
  ],
  methods: [
    function send(data) {
      if ( typeof data == "string" ) {
        var opcode = 1;
        data = new Buffer(data);
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
            this.socket.end();
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

foam.CLASS({
  package: 'foam.net.node',
  name: 'Frame',
  properties: [
    ['fin', 1],
    ['rsv1',0],
    ['rsv2',0],
    ['rsv3',0],
    ['opcode',1],
    ['mask',0],
    'maskingKey',
    'buffer',
    ['bufferPos', 0],
    ['needed', 0],
    {
      type: 'Boolean',
      name: 'framing',
      value: true
    },
    {
      type: 'Boolean',
      name: 'finished',
      value: false
    },
  ],
  methods: [
    function toData() {
      this.length = this.buffer.length;
      var headerSize = this.buffer.length > 65535 ? 10 :
          (this.buffer.length > 125 ? 4 : 2);

      var i = 0;
      var buffer = new Buffer(this.buffer.length + headerSize);
      // FIN = 1, RSV1-3 = 0
      buffer.writeUInt8(
        0x80 +
          this.opcode, i++);

      var length = this.length;
      if ( length > 0xffffffff ) {
        console.error("Too large a frame to support in JS");
      } else if ( length > 65535 ) {
        buffer.writeUInt8(127, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8((length >> 24) & 0xff, i++)
        buffer.writeUInt8((length >> 16) & 0xff, i++)
        buffer.writeUInt8((length >> 8) & 0xff, i++)
        buffer.writeUInt8((length & 0xff), i++)
      } else if ( length > 125 ) {
        buffer.writeUInt8(126, i++);
        buffer.writeUInt8((length & 0xff00) >> 8, i++)
        buffer.writeUInt8(length & 0xff, i++)
      } else {
        buffer.writeUInt8(length & 0x7f, i++);
      }

      this.buffer.copy(buffer, i);

      return buffer;
    },
    function onData(data, i) {
      if ( this.framing ) {
        var byte = data.readUInt8(i++);
        this.opcode = byte & 0x0f;
        this.fin = !! ( byte & 0x80 );
        this.rsv1 = !! ( byte & 0x40 );
        this.rsv2  = !! ( byte & 0x20 );
        this.rsv3 = !! ( byte & 0x10 );

        byte = data.readUInt8(i++);
        this.mask = !! ( byte & 0x80 );
        var length = byte & 0x7f;

        if ( length == 126 ) {
          length = 0;
          byte = data.readUInt8(i++);
          length += byte << 8;
          byte = data.readUInt8(i++);
          length += byte;
        } else if ( length == 127 ) {
          length = 0;
          var tolarge = false;
          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 56;

          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 48;

          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 40;

          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 32;

          byte = data.readUInt8(i++);
          length += byte << 24;
          byte = data.readUInt8(i++);
          length += byte << 16;
          byte = data.readUInt8(i++);
          length += byte << 8;
          byte = data.readUInt8(i++);
          length += byte;

          if ( tolarge ) {
            console.error("Payload too large.");
            this.socket.end();
            return;
          }
        }
        this.length = length;
        this.buffer = new Buffer(this.length);
        this.bufferPos = 0;
        this.needed = this.length;
        this.framing = false;

        if ( this.mask ) {
          this.masking_key = [];
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
        }
      }

      var amount = Math.min(data.length - i, this.needed);
      data.copy(this.buffer, this.bufferPos, i, i + amount);

      if ( this.mask ) {
        for ( var j = this.bufferPos ; j < this.bufferPos + amount; j++ ) {
          this.buffer.writeUInt8(this.buffer.readUInt8(j) ^ this.masking_key[j % 4], j);
        }
      }

      this.bufferPos += amount;
      this.needed -= amount;
      i += amount;

      if ( this.needed == 0 ) {
        this.finished = true;
      }

      return i;
    }
  ]
});

foam.CLASS({
  package: 'foam.net.node',
  name: 'WebSocketService',
  requires: [
    'foam.net.node.WebSocket'
  ],
  properties: [
    {
      name: 'port'
    },
    {
      name: 'server'
    },
    {
      name: 'delegate'
    },
    {
      class: 'Map',
      name: 'sockets'
    }
  ],
  topics: [
    'message'
  ],
  methods: [
    function init() {
      this.server = require('http').createServer(this.onRequest);
      this.server.listen(this.port);
      this.server.on('upgrade', this.onUpgrade);
    },
    function addSocket(socket) {
//      this.sockets[socket.id] = socket;
      var sub = socket.message.sub(this.onMessage);
      socket.disconnected.sub(function() {
        sub.destroy();
//        delete this.sockets[socket.id];
      });
    }
  ],
  listeners: [
    function onMessage(s, _, msg) {
      this.delegate.send(foam.json.parse(foam.json.parseString(msg)));
    },
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
