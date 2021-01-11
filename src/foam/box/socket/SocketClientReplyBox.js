/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketClientReplyBox',
  extends: 'foam.box.ReplyBox',

  documentation: `Provides for 'reply' socket box reuse via the SocketConnectionBoxManager.`,

  javaImports: [
    'foam.box.Box',
    'foam.core.X',
    'java.net.Socket'
  ],

  properties: [
    {
      class: 'String',
      name: 'replyBoxId'
    },
    {
      name: 'created',
      class: 'DateTime',
      javaFactory: 'return new java.util.Date();'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public SocketClientReplyBox(String replyBoxId) {
    setReplyBoxId(replyBoxId);
    setCreated(new java.util.Date());
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
      X x = msg.getX();
      Socket socket = (Socket) x.get("socket");
      if ( socket == null ) {
        x = getX();
        socket = (Socket) x.get("socket");
      }
      if ( socket != null ) {
        msg.getAttributes().put(SocketConnectionBox.REPLY_BOX_ID, getReplyBoxId());
        Box box = ((SocketConnectionBoxManager) x.get("socketConnectionBoxManager")).getReplyBox(x, socket.getRemoteSocketAddress().toString());
        box.send(msg);
      } else {
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
        if ( logger == null ) {
          logger = new foam.nanos.logger.StdoutLogger();
        }
        logger.error(this.getClass().getSimpleName(), "send,Socket not found", "replyBoxId", getReplyBoxId(), "message abandoned", msg, new Exception("Socket not found."));
      }
      `
    }
  ]
});
