/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
        throw foam.net.NotConnectedExeption.create();
      }
      this.socket.send(msg);
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
    },

    function disconnect() {
      this.socket && this.socket.close();
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
