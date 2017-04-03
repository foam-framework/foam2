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
  package: 'foam.net.web',
  name: 'WebSocket',

  topics: [
    'message',
    'connected',
    'disconnected'
  ],

  properties: [
    {
      name: 'uri'
    },
    {
      name: 'socket',
      transient: true
    }
  ],

  methods: [
    function send(msg) {
      // Apparently you can't catch exceptions from calling .send()
      // when the socket isn't open.  So we'll try to predict an exception
      // happening and throw early.
      //
      // There could be a race condition here if the socket
      // closes between our check and .send().
      if ( this.socket.readyState !== this.socket.OPEN ) {
        throw new Error('Socket is not open');
      }
      this.socket.send(foam.json.Network.stringify(msg));
    },

    function connect() {
      var socket = this.socket = new WebSocket(this.uri);
      var self = this;

      return new Promise(function(resolve, reject) {
        function onConnect() {
          socket.removeEventListener('open', onConnect);
          resolve(self);
        }
        function onConnectError(e) {
          socket.removeEventListener('error', onConnectError);
          reject();
        }
        socket.addEventListener('open', onConnect);
        socket.addEventListener('error', onConnectError);

        socket.addEventListener('open', function() {
          self.connected.pub();
        });
        socket.addEventListener('message', self.onMessage);
        socket.addEventListener('close', function() {
          self.disconnected.pub();
        });
      });
    }
  ],

  listeners: [
    {
      name: 'onMessage',
      code: function(msg) {
        this.message.pub(msg.data);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'WebSocketService',

  requires: [
    'foam.net.web.WebSocket',
    'foam.box.RegisterSelfMessage',
    'foam.box.Message'
  ],

  properties: [
    {
      name: 'delegate'
    }
  ],

  methods: [
    function addSocket(socket) {
      var sub1 = socket.message.sub(function onMessage(s, _, msg) {
        msg = foam.json.parseString(msg, this);

        if ( ! this.Message.isInstance(msg) ) {
          console.warn("Got non-message object.", msg);
        }

        if ( this.RegisterSelfMessage.isInstance(msg.object) ) {
          var named = foam.box.NamedBox.create({
            name: msg.object.name
          });

          named.delegate = foam.box.RawWebSocketBox.create({
            socket: socket
          });
        } else {
          this.delegate.send(msg);
        }
      }.bind(this));

      socket.disconnected.sub(function(s) {
        s.detach();
        sub1.detach();
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'HTTPResponse',

  topics: [
    'data',
    'err',
    'end'
  ],

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
        throw new Error('Unsupported response type: ' + this.responseType);
      }
    },
    {
      class: 'Boolean',
      name: 'streaming',
      value: false
    },
    {
      class: 'Boolean',
      name: 'success',
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

  methods: [
    function start() {
      var reader = this.resp.body.getReader();
      this.streaming = true;

      var onError = foam.Function.bind(function(e) {
        this.err.pub();
        this.end.pub();
      }, this);

      var onData = foam.Function.bind(function(e) {
        if ( e.value ) {
          this.data.pub(e.value);
        }

        if ( e.done || ! this.streaming) {
          this.end.pub();
          return this;
        }
        return reader.read().then(onData, onError);
      }, this);

      return reader.read().then(onData, onError);
    },

    function stop() {
      this.streaming = false;
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'HTTPRequest',

  requires: [
    'foam.net.web.HTTPResponse'
  ],

  topics: [
    'data'
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
      name: 'protocol',
      preSet: function(old, nu) {
        return nu.replace(':','');
      }
    },
    {
      class: 'String',
      name: 'path',
      preSet: function(old, nu) {
        if ( ! nu.startsWith('/') ) return '/'+nu;
        return nu;
      }
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
      name: 'payload'
    },
    {
      // TODO: validate acceptable types
      class: 'String',
      name: 'responseType',
      value: 'text'
    }
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
        redirect: "follow",
        credentials: "same-origin"
      };

      if ( this.payload ) {
        options.body = this.payload;
      }

      var request = new Request(
          this.protocol + "://" +
          this.hostname +
          ( this.port ? ( ':' + this.port ) : '' ) +
          this.path,
          options);

      return fetch(request).then(function(resp) {
        var resp = this.HTTPResponse.create({
          resp: resp,
          responseType: this.responseType
        });

        if ( resp.success ) return resp;
        throw resp;
      }.bind(this));
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'EventSource',

  requires: [
    'foam.parse.Grammar',
    'foam.net.web.HTTPRequest',
    'foam.encodings.UTF8'
  ],

  imports: [
    'setTimeout',
    'clearTimeout'
  ],

  topics: [
    {
      name: 'message'
    }
  ],

  properties: [
    {
      name: 'grammar',
      factory: function() {
        var self = this;
        return this.Grammar.create({
          symbols: function(repeat, alt, sym, notChars, seq) {
            return {
              START: sym('line'),

              line: alt(
                sym('event'),
                sym('data')),

              event: seq('event: ', sym('event name')),
              'event name': repeat(notChars('\r\n')),

              data: seq('data: ', sym('data payload')),
              'data payload': repeat(notChars('\r\n'))
            }
          }
        }).addActions({
          'event name': function(v) {
            self.eventName = v.join('');
          },
          'data payload': function(p) {
            self.eventData = p.join('');
          }
        });
      }
    },
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
      name: 'retryTimer'
    },
    {
      class: 'Int',
      name: 'delay',
      preSet: function(_, a) {
        if ( a > 30000 ) return 30000;
        return a;
      },
      value: 1
    },
    'eventData',
    'eventName'
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
      this.keepAlive();
      req.send().then(function(resp) {
        if ( ! resp.success ) {
          this.onError();
          return;
        }

        this.clearProperty('decoder');
        resp.data.sub(this.onData);
        resp.end.sub(this.onError);
        this.resp = resp;
        resp.start();
      }.bind(this), this.onError);
    },

    function keepAlive() {
      if ( this.retryTimer ) {
        this.clearTimeout(this.retryTimer);
      }

      this.retryTimer = this.setTimeout(foam.Function.bind(function() {
        this.retryTimer = 0;
        this.onError();
      }, this), 30000);
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

      this.grammar.parseString(line);
    }
  ],

  listeners: [
    function onData(s, _, data) {
      this.delay = 1;
      this.keepAlive();

      this.decoder.put(data);
      var string = this.decoder.string;
      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }
      this.decoder.string = string;
    },

    function onError() {
      this.delay *= 2;
      this.setTimeout(this.onEnd, this.delay);
    },

    function onEnd() {
      if ( this.running ) {
        this.start();
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'XMLHTTPRequest',
  extends: 'foam.net.web.HTTPRequest',

  requires: [
    'foam.net.web.XMLHTTPResponse as HTTPResponse'
  ],

  methods: [
    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }

      var xhr = new XMLHttpRequest();
      xhr.open(
          this.method,
          this.protocol + "://" +
          this.hostname + ( this.port ? ( ':' + this.port ) : '' ) +
          this.path);
      xhr.responseType = this.responseType;
      for ( var key in this.headers ) {
        xhr.setRequestHeader(key, this.headers[key]);
      }

      var self = this;
      return new Promise(function(resolve, reject) {
        xhr.addEventListener('readystatechange', function foo() {
          if ( this.readyState === this.LOADING ||
               this.readyState === this.DONE ) {
            this.removeEventListener('readystatechange', foo);
            var resp = self.HTTPResponse.create({
              xhr: this
            });

            if ( resp.success ) resolve(resp);
            else reject(resp);
          }
        });
        xhr.send(self.payload);
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'XMLHTTPResponse',
  extends: 'foam.net.web.HTTPResponse',

  constants: {
    STREAMING_LIMIT: 10 * 1024 * 1024
  },

  properties: [
    {
      name: 'xhr',
      postSet: function(_, xhr) {
        this.status = xhr.status;
        var headers = xhr.getAllResponseHeaders().split('\r\n');
        for ( var i = 0 ; i < headers.length ; i++ ) {
          var sep = headers[i].indexOf(':');
          var key = headers[i].substring(0, sep);
          var value = headers[i].substring(sep+1);
          this.headers[key.trim()] = value.trim();
        }
        this.responseType = xhr.responseType;
      }
    },
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) {
          return null;
        }

        var self = this;
        var xhr = this.xhr;

        if ( xhr.readyState === xhr.DONE )
          return Promise.resolve(xhr.response);
        else
          return new Promise(function(resolve, reject) {
            xhr.addEventListener('readystatechange', function() {
              if ( this.readyState === this.DONE )
                resolve(this.response);
            });
          });
      }
    },
    {
      class: 'Int',
      name: 'pos',
      value: 0
    }
  ],

  methods: [
    function start() {
      this.streaming = true;
      this.xhr.addEventListener('loadend', function() {
        this.done.pub();
      }.bind(this));

      this.xhr.addEventListener('progress', function() {
        var substr = this.xhr.responseText.substring(this.pos);
        this.pos = this.xhr.responseText.length;
        this.data.pub(substr);

        if ( this.pos > this.STREAMING_LIMIT ) {
          this.xhr.abort();
        }
      }.bind(this));
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'SafariEventSource',
  extends: 'foam.net.web.EventSource',

  requires: [
    'foam.net.web.XMLHTTPRequest as HTTPRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'buffer'
    }
  ],

  listeners: [
    function onData(s, _, data) {
      this.delay = 1;
      this.keepAlive();

      this.buffer += data;
      var string = this.buffer;

      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }

      this.buffer = string;
    }
  ]
});
