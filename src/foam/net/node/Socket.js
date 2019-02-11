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
  name: 'Socket',
  flags: ['node'],
  imports: [
    'me',
    'socketService'
  ],

  requires: [ 'foam.box.RegisterSelfMessage' ],

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
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      factory: function() {
        // Use default FOAM implementation of Outputter. Do not attempt to
        // lookup sensitive "foam.json.Outputter" class in box context.
        return foam.lookup('foam.json.Outputter').create({
          pretty: false,
          formatDatesAsNumbers: true,
          outputDefaultValues: false,
          strict: true,
          propertyPredicate: function(o, p) { return ! p.networkTransient; }
        }, this);
      }
    }
  ],

  methods: [
    function write(msg) {
      var serialized = this.outputter.stringify(msg);
      var size = Buffer.byteLength(serialized);
      var packet = Buffer.alloc(size + 4);
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
            this.buffer = Buffer.alloc(this.nextSize);
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
