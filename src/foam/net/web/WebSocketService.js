/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net.web',
  name: 'WebSocketService',

  requires: [
    'foam.box.Message',
    'foam.json.Parser',
    'foam.net.web.WebSocket',
    'foam.box.RawWebSocketBox'
  ],

  imports: [ 'creationContext' ],

  properties: [
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
    function addSocket(socket) {
      var X = this.creationContext.createSubContext({
        returnBox: this.RawWebSocketBox.create({ socket: socket })
      });

      var sub1 = socket.message.sub(function onMessage(s, _, msgStr) {
        try {
          var msg = this.parser.parseString(msgStr, X);

          if ( ! this.Message.isInstance(msg) ) {
            console.warn('Got non-message', msg.cls_.id);
            console.warn('  payload was: ', msgStr);
            return;
          }

          this.delegate.send(msg);
        } catch (e) {
          console.error("WSS Error:", e);
        }
      }.bind(this));

      socket.disconnected.sub(function(s) {
        s.detach();
        sub1.detach();
      });
    }
  ]
});
