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
    'payload',
    {
      class: 'Map',
      name: 'headers'
    },
    'error',
    {
      name: "success",
      expression: function(status) {
        return status < 300 && status >= 200;
      }
    }
  ],
  topics: [
    'data',
    'end'
  ],
  methods: [
    function start() {
      // TODO: Is this the right behaviour, or should we throw immediately rather than with a promise.
      return Promise.reject(new Error("XHR based HTTPResponse does not support streaming"));
    },
    function stop() {
      // TODO: Is this the right behaviour, or should we throw immediately rather than with a promise.
      return Promise.reject(new Error("XHR based HTTPResponse does not support streaming"));
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
      class: 'Boolean',
      name: 'streaming',
      value: false
    },
    {
      // TODO: validate
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
      if ( this.url ) this.fromUrl(this.url);

      var xhr = new XMLHttpRequest();
      xhr.open(this.method || "GET", this.protocol + "://" + this.hostname +
               ( this.port ? (':' + this.port) : '' ) + this.path);

      var self = this;
      return new Promise(function(resolve, reject) {
        xhr.addEventListener('readystatechange', function() {
          if ( this.readyState == this.DONE ) {
            var response = self.HTTPResponse.create({
              status: this.status,
              payload: this.response
            });
            if ( response.success ) {
              resolve(response);
            } else {
              reject(response);
            }
          }
        });
        xhr.send(self.payload);
      });
    }
  ]
});
