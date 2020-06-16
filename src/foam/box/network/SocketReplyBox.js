/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.network',
  name: 'SocketReplyBox',
  implements: [
    'foam.box.Box'
  ],

  javaImports: [
    'java.io.IOException',
    'java.net.Socket',
    'java.nio.ByteBuffer',
    'java.nio.charset.StandardCharsets',
    'java.io.OutputStream',
  ],

  properties: [
    {
      class: 'Long',
      name: 'syncBoxId'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
    @Override
    protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
      foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
      formatter.setQuoteKeys(true);
      formatter.setPropertyPredicate(new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
      return formatter;
    }

    @Override
    public foam.lib.formatter.FObjectFormatter get() {
      foam.lib.formatter.FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };
        `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      try {
        Socket socket = (Socket) getX().get("tcpSocket");
        msg.getAttributes().put("syncBoxId", getSyncBoxId());
        synchronized (socket) {
          foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
          formatter.setX(getX());
          formatter.output(msg);
          String responseMsg = formatter.builder().toString();
          byte[] messageBytes = responseMsg.getBytes(StandardCharsets.UTF_8);
          int messageSize = messageBytes.length;
          ByteBuffer responseBuffer = ByteBuffer.allocate(4+messageSize);
          responseBuffer.putInt(messageSize).put(messageBytes);
          OutputStream os = socket.getOutputStream();
          os.write(responseBuffer.array(), 0, 4+messageSize);
          os.flush();
        }
      } catch ( IOException ioe ) {
        throw new RuntimeException(ioe);
      }
      `
    }
  ]
})
