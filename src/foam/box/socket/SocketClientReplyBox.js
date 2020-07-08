/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketClientReplyBox',
  extends: 'foam.box.ReplyBox',

  javaImports: [
    'foam.box.Box',
    'foam.core.X',
    'java.net.Socket'
  ],

  properties: [
    {
      class: 'Long',
      name: 'replyBoxId'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public SocketClientReplyBox(Long replyBoxId) {
    setReplyBoxId(replyBoxId);
  }
        `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      X x = getX();
      Socket socket = (Socket) x.get("socket");
      if ( socket == null ) {
        x = msg.getX();
        socket = (Socket) x.get("socket");
        if ( socket != null ) {
          ((foam.nanos.logger.Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "send,Using Msg context.");
        }
      }

      msg.getAttributes().put(SocketConnectionBox.REPLY_BOX_ID, getReplyBoxId());
      if ( socket != null ) {
        Box box = ((SocketConnectionBoxManager) x.get("socketConnectionBoxManager")).getReplyBox(x, socket.getRemoteSocketAddress().toString());
        box.send(msg);
      } else {
        ((foam.nanos.logger.Logger) x.get("logger")).error(this.getClass().getSimpleName(), "send,Socket not found");
      }
      `
    }
  ]
});
