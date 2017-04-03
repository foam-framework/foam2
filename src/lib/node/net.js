/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
    ['length', 0],
    ['length_', 0],
    'headerState',
    'state',
    {
      class: 'Boolean',
      name: 'framing',
      value: true
    },
    {
      class: 'Boolean',
      name: 'finished',
      value: false
    }
  ],

  methods: [
    function init() {
      this.headerState = this.frameHeader;
      this.state = this.readHeader;
    },

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

    function frameHeader(byte) {
      this.opcode = byte & 0x0f;
      this.fin  = !! ( byte & 0x80 );
      this.rsv1 = !! ( byte & 0x40 );
      this.rsv2 = !! ( byte & 0x20 );
      this.rsv3 = !! ( byte & 0x10 );

      this.headerState = this.maskLength0;
    },

    function maskLength0(byte) {
      this.mask = !! ( byte & 0x80 );
      this.length_ = byte & 0x7f;

      if ( this.length_ == 126 ) {
        this.headerState = this.lengthShort0;
      } else if ( this.length_ === 127 ) {
        this.headerState = this.lengthShort1;
      } else {
        this.headerState = this.maskingKey0;
      }
    },

    function lengthShort0(byte) {
      this.length_ = 0;
      this.length_ += byte << 8;
      this.headerState = this.lengthShort1;
    },

    function lengthShort1(byte) {
      this.length_ += byte;
      this.headerState = this.maskingKey0;
    },

    function lengthLong0(byte) {
      this.length_ = 0;
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong1;
    },

    function lengthLong1(byte) {
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong2;
    },

    function lengthLong2(byte) {
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong3;
    },

    function lengthLong3(byte) {
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong4;
    },

    function lengthLong4(byte) {
      this.length_ += byte << 24;
      this.headerState = this.lengthLong5;
    },

    function lengthLong5(byte) {
      this.length_ += byte << 16;
      this.headerState = this.lengthLong6;
    },

    function lengthLong6(byte) {
      this.length_ += byte << 8;
      this.headerState = this.lengthLong7;
    },

    function lengthLong7(byte) {
      this.length_ += byte;
      this.headerState = this.maskingKey0;
    },

    function maskingKey0(byte) {
      this.length = this.length_
      this.buffer = new Buffer(this.length);
      this.bufferPos = 0;
      this.needed = this.length;

      if ( this.mask ) {
        this.masking_key = [];
        this.masking_key.push(byte);
        this.headerState = this.maskingKey1;
      } else {
        this.headerState = this.frameHeader;
        this.state = this.readData;
      }
    },

    function maskingKey1(byte) {
      this.masking_key.push(byte);
      this.headerState = this.maskingKey2;
    },

    function maskingKey2(byte) {
      this.masking_key.push(byte);
      this.headerState = this.maskingKey3;
    },

    function maskingKey3(byte) {
      this.masking_key.push(byte);
      this.headerState = this.frameHeader;
      this.state = this.readData;
    },

    function readHeader(data, i) {
      while ( this.state === this.readHeader &&
              i < data.byteLength ) {
        this.headerState(data.readUInt8(i++));
      }
      return i;
    },

    function readData(data, i) {
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
    },

    function tooLarge(data, i) {
      console.error('WebSocket payload too large');
      this.socket.end();
    },

    function onData(data, i) {
      return this.state(data, i);
    }
  ]
});


foam.CLASS({
  package: 'foam.net.node',
  name: 'Socket',

  imports: [
    'socketService',
    'me'
  ],

  requires: [
    'foam.box.RegisterSelfMessage'
  ],

  topics: [
    'message',
    'disconnect',
    'connect'
  ],

  properties: [
    {
      name: 'remoteAddress'
    },
    {
      name: 'remotePort'
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
          this.remotePort = s.remotePort;
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

  methods: [
    function write(msg) {
      var serialized = foam.json.Network.stringify(msg);
      var size = Buffer.byteLength(serialized);
      var packet = new Buffer(size + 4);
      packet.writeInt32LE(size);
      packet.write(serialized, 4);
      this.socket_.write(packet);
    },

    function connectTo(address) {
      var sep = address.lastIndexOf(':');
      var host = address.substring(0, sep);
      var port = address.substring(sep + 1);
      return new Promise(function(resolve, reject) {
        require('dns').lookup(host, function(err, address, family) {
          host = address || host;
          var socket = new require('net').Socket();
          socket.once('error', function(e) {
            reject(e);
          });
          socket.once('connect', function() {
            this.socket_ = socket;
            this.write(this.RegisterSelfMessage.create({
              name: this.me.name
            }));
            this.socketService.addSocket(this);
            this.connect.pub();
            resolve(this);
          }.bind(this));

          socket.connect(port, host);
        }.bind(this));
      }.bind(this));
    },

    function onMessage() {
      var data = this.buffer.toString();
      this.message.pub(data);
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

          var written = data.copy(
              this.buffer,
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
  package: 'foam.net.node',
  name: 'SocketService',

  requires: [
    'foam.net.node.Socket',
    'foam.box.RegisterSelfMessage'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'listen',
      value: true
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
    }
  ],

  methods: [
    function init() {
      if ( ! this.listen ) return;

      var server = this.server = new require('net').Server();
      this.server.on('connection', this.onConnection);
      this.server.on('error', function(e) {
        console.log("Server error", e);
        server.unref();
      }.bind(this));

      if ( this.listen ) this.server.listen(this.port);
    },

    function addSocket(socket) {
      var s1 = socket.message.sub(function(s, _, m) {
        var m = foam.json.parseString(m, this);

        if ( this.RegisterSelfMessage.isInstance(m) ) {
          var named = foam.box.NamedBox.create({
            name: m.name
          });

          named.delegate = foam.box.RawSocketBox.create({
            socket: socket
          });
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


foam.CLASS({
  package: 'foam.net.node',
  name: 'WebSocket',

  requires: [
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
    'currentFrame'
  ],

  methods: [
    function send(data) {
      if ( foam.box.Message.isInstance(data) ) {
        data = foam.json.Network.stringify(data);
      }

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
  name: 'WebSocketService',
  extends: 'foam.net.web.WebSocketService',

  requires: [
    'foam.net.node.WebSocket',
    'foam.box.RegisterSelfMessage'
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
    }
  ],

  methods: [
    function init() {
      this.server = require('http').createServer(this.onRequest);
      this.server.listen(this.port);
      this.server.on('upgrade', this.onUpgrade);
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


foam.CLASS({
  package: 'foam.net.node',
  name: 'HTTPRequest',
  extends: 'foam.net.web.HTTPRequest',

  requires: [
    'foam.net.node.HTTPResponse'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'followRedirect',
      value: true
    }
  ],

  methods: [
    function fromUrl(url) {
      var data = require('url').parse(url);
      this.protocol = data.protocol.slice(0, -1);
      this.hostname = data.hostname;
      if ( data.port ) this.port = data.port;
      this.path = data.path;
    },

    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }

      if ( this.protocol !== 'http' && this.protocol !== 'https' )
        throw new Error("Unsupported protocol '" + this.protocol + "'");

      var options = {
        hostname: this.hostname,
        headers: this.headers,
        method: this.method,
        path: this.path
      };
      if ( this.port ) options.port = this.port;

      return new Promise(function(resolve, reject) {
        var req = require(this.protocol).request(options, function(nodeResp) {
          var resp = this.HTTPResponse.create({
            resp: nodeResp,
            responseType: this.responseType
          });

          if ( this.followRedirect &&
               ( resp.status === 301 ||
                 resp.status === 302 ||
                 resp.status === 303 ||
                 resp.status === 307 ||
                 resp.status === 308 ) ) {
            resolve(this.cls_.create({
              url: resp.headers.location,
              method: this.method,
              payload: this.payload,
              responseType: this.responseType,
              headers: this.headers,
              followRedirect: true
            }).send());
            return;
          }

          var buffer = '';
          nodeResp.on('data', function(d) {
            buffer += d.toString();
          });
          nodeResp.on('end', function() {
            resp.payload = buffer;
            if ( resp.success ) resolve(resp);
            else reject(resp);
          });
          nodeResp.on('error', function(e) {
            reject(e);
          });
        }.bind(this));

        req.on('error', function(e) {
          reject(e);
        });

        if ( this.payload ) req.write(this.payload);
        req.end();
      }.bind(this));
    }
  ]
});


foam.CLASS({
  package: 'foam.net.node',
  name: 'HTTPResponse',
  extends: 'foam.net.web.HTTPResponse',

  properties: [
    {
      name: 'payload',
      adapt: function(_, str) {
        if ( this.streaming ) return null;

        switch (this.responseType) {
        case 'text':
          return str;
        case 'json':
          return JSON.parse(str);
        }

        // TODO: responseType should be an enum and/or have validation
        throw new Error('Unsupported response type: ' + this.responseType);
      }
    },
    {
      name: 'resp',
      postSet: function(_, r) {
        this.status = r.statusCode;
        this.headers = {};
        for ( var key in r.headers ) {
          this.headers[key.toLowerCase()] = r.headers[key];
        }
      }
    }
  ],

  methods: [
    function start() {
      this.streaming = true;

      return new Promise(function(resolve, reject) {
        this.resp.on('data', function(chunk) {
          this.data.pub(chunk);
        }.bind(this));

        this.resp.on('end', function() {
          this.end.pub();
          resolve(this);
        }.bind(this));

        this.resp.on('error', function(e) {
          reject(e);
        });
      }.bind(this));
    },

    function stop() {
      // TODO?
    }
  ]
});
