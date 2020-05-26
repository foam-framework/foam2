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
    'foam.lib.json.Outputter',
    'foam.lib.NetworkPropertyPredicate'
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      try {
        Socket socket = (Socket) getX().get("tcpSocket");
        synchronized (socket) {
          OutputStream os = socket.getOutputStream();
          String responseMsg = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify(msg);
          byte[] messageBytes = responseMsg.getBytes(StandardCharsets.UTF_8);
          int messageSize = messageBytes.length;
          ByteBuffer responseBuffer = ByteBuffer.allocate(4+messageSize);
          responseBuffer.putInt(messageSize).put(messageBytes);
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
