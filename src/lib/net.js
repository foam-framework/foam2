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
  package: 'foam.net',
  name: 'WebSocket',
  properties: [
    {
      name: 'uri',
    },
    {
      name: 'socket',
      transient: true
    }
  ],
  topics: [
    'message',
    'connected',
    'disconnected'
  ],
  methods: [
    function send(msg) {
      // TODO: Error handling
      this.socket.send(msg);
    }
  ],
  listeners: [
    {
      name: 'connect',
      code: function() {
        var socket = this.socket = new WebSocket(this.uri);
        var self = this;
        socket.addEventListener('open', function() {
          self.connected.pub();
        })
        socket.addEventListener('message', this.onMessage);
        socket.addEventListener('close', function() {
          self.disconnected.pub();
        });
      }
    },
    {
      name: 'onMessage',
      code: function(msg) {
        foam.json.parse(foam.json.parseString(msg.data));
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.net',
  name: 'WebSocketService',
  requires: [
    'foam.net.WebSocket'
  ],
  exports: [
    'as webSocketService'
  ],
  properties: [
    {
      class: 'Map',
      of: 'foam.net.WebSocket',
      name: 'sockets'
    },
    {
      name: 'delegate'
    }
  ],
  methods: [
    function listen() {
    },
    function getSocket(uri) {
      if ( this.sockets[uri] )
        return Promise.resolve(this.sockets[uri]);

      return new Promise(function(resolve, reject) {
        var s = this.WebSocket.create({
          uri: uri
        });

        s.connected.sub(function(sub) {
          sub.destroy();
          this.addSocket(s);
          resolve(s);
        }.bind(this));

        s.connect();
      }.bind(this));
    },
    function addSocket(s) {
      s.message.sub(this.onMessage);
      s.disconnected.sub(function() {
        delete this.sockets[s.uri]
      }.bind(this));
      this.sockets[s.uri] = s;
    }
  ],
  listeners: [
    {
      name: 'onMessage',
      code: function(s, _, m) {
        this.delegate && this.delegate.send(m);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.net',
  name: 'HTTPResponse',
  properties: [
    {
      class: 'Int',
      name: 'status'
    },
    {
      class: 'String',
      name: 'responseType'
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) {
          return null;
        }

        switch (this.responseType) {
        case "text":
          return this.resp.text();
        case "blob":
          return this.resp.blob();
        case "arraybuffer":
          return this.resp.arraybuffer();
        case "json":
          return this.resp.json();
        }
        // TODO: responseType should be an enum and/or have validation
        throw new Error("Unsupported response type");
      }
    },
    {
      class: 'Boolean',
      name: 'streaming',
      value: false
    },
    {
      class: 'Boolean',
      name: "success",
      expression: function(status) {
        return status >= 200 && status <= 299;
      }
    },
    {
      name: 'resp',
      postSet: function(_, r) {
        var iterator = r.headers.entries();
        var next = iterator.next();
        while ( ! next.done ) {
          this.headers[next.value[0]] = next.value[1];
          next = iterator.next();
        }
        this.status = r.status;
      }
    }
  ],
  topics: [
    'data',
    'end'
  ],
  methods: [
    function start() {
      var reader = this.resp.body.getReader();
      this.streaming = true;

      var onData = foam.Function.bind(function(e) {
        if ( e.value ) {
          this.data.pub(e.value);
        }

        if ( e.done || ! this.streaming) {
          this.end.pub();
          return this;
        }
        return reader.read().then(onData);
      }, this);

      return reader.read().then(onData);
    },
    function stop() {
      this.streaming = false;
    }
  ]
});

foam.CLASS({
  package: 'foam.net',
  name: 'HTTPRequest',
  requires: [
    'foam.net.HTTPResponse'
  ],
  properties: [
    {
      class: 'String',
      name: 'hostname'
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'protocol'
    },
    {
      class: 'String',
      name: 'path'
    },
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'method'
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      class: 'String',
      name: 'payload'
    },
    {
      // TODO: validate acceptable types
      class: 'String',
      name: 'responseType',
      value: 'text'
    }
  ],
  topics: [
    'data'
  ],
  methods: [
    function fromUrl(url) {
      var u = new URL(url);
      this.protocol = u.protocol.substring(0, u.protocol.length-1);
      this.hostname = u.hostname;
      if ( u.port ) this.port = u.port;
      this.path = u.pathname + u.search;
    },
    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }

      var self = this;

      var headers = new Headers();
      for ( var key in this.headers ) {
        headers.set(key, this.headers[key]);
      }

      var options = {
        method: this.method,
        headers: headers,
        mode: "cors",
        redirect: "follow"
      };

      if ( this.payload ) {
        options.body = this.payload;
      }


      var request = new Request(
        this.protocol + "://" + this.hostname + ( this.port ? ( ':' + this.port ) : '' ) + this.path,
        options);

      return fetch(request).then(function(resp) {
        return this.HTTPResponse.create({
          resp: resp,
          responseType: this.responseType
        });
      }.bind(this));
    }
  ]
});

foam.CLASS({
  package: 'foam.net',
  name: 'EventSource',
  requires: [
    'foam.net.HTTPRequest',
    'foam.encodings.UTF8',
    'foam.parse.StringPS'
  ],
  properties: [
    {
      class: 'String',
      name: 'uri'
    },
    {
      class: 'Boolean',
      name: 'running',
      value: false
    },
    {
      name: 'resp'
    },
    {
      name: 'decoder',
      factory: function() {
        return this.UTF8.create()
      }
    },
    {
      name: 'ps',
      factory: function() {
        return this.StringPS.create();
      }
    },
    'eventData',
    'eventName'
  ],
  topics: [
    {
      name: 'message',
      topics: [
        'put',
        'patch',
        'keep-alive',
        'cancel',
        'auth_revoked'
      ]
    }
  ],
  grammar: function(repeat, alt, sym, notChars, seq) {
    return {
      line: alt(
        sym('event'),
        sym('data')),

      event: seq('event: ', sym('event name')),
      'event name': repeat(notChars('\r\n')),

      data: seq('data: ', sym('data payload')),
      'data payload': repeat(notChars('\r\n'))
    };
  },
  grammarActions: [
    {
      name: 'event name',
      code: function(v) {
        this.eventName = v.join('');
      }
    },
    {
      name: 'data payload',
      code: function(p) {
        this.eventData = JSON.parse(p.join(''));
      }
    }
  ],
  methods: [
    function start() {
      var req = this.HTTPRequest.create({
        method: "GET",
        url: this.uri,
        headers: {
          'accept': 'text/event-stream'
        }
      });

      this.running = true;
      req.send().then(function(resp) {
        resp.data.sub(this.onData);
        resp.end.sub(this.onEnd);
        this.resp = resp;
        resp.start();
      }.bind(this));
    },
    function close() {
      this.running = false;
      this.resp.stop();
    },
    function dispatchEvent() {
      // Known possible events names
      // put
      // patch
      // keep-alive
      // cancel
      // auth revoked

      this.message.pub(this.eventName, this.eventData);
      this.eventName = null;
      this.eventData = null;
    },
    function processLine(line) {
      // TODO: This can probably be simplified by using state machine based
      // parsers, but in the interest of saving time we're going to do it line
      // by line for now.  Something we know works from previous interations.

      if ( line.length == 0 ) {
        this.dispatchEvent();
        return;
      }

      this.ps.setString(line);
      this.line(this.ps);
    }
  ],
  listeners: [
    function onData(s, _, data) {
      this.decoder.put(data);
      var string = this.decoder.string;
      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }
      this.decoder.string = string;
    },
    function onEnd() {
      // TODO: Exponential backoff in the case of errors.
      if ( this.running ) {
        this.start();
      }
    }
  ]
});
