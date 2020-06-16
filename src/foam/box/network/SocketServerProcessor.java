/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box.network;

import foam.box.Box;
import foam.core.X;
import foam.core.ContextAware;
import foam.nanos.tcp.SocketRouter;
import foam.nanos.logger.Logger;

import java.net.ServerSocket;
import java.net.Socket;
import java.io.InputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import foam.core.ContextAgent;

public class SocketServerProcessor
  extends Thread
  implements ContextAware, ContextAgent
{
  protected X x_;
  protected Socket socket_;
  protected SocketRouter socketRouter_;
  protected InputStream in_;

  public SocketServerProcessor(X x, Socket socket)
    throws IOException
  {
    x_ = x;
    socket_ = socket;
    in_ = socket.getInputStream();
    socketRouter_ = new SocketRouter(x);
  }

  @Override
  public void run()
  {
    while ( true ) {
      try {
        byte[] msgLenByte = new byte[4];
        in_.read(msgLenByte, 0, 4);
        int msgLen = ByteBuffer.wrap(msgLenByte).getInt();
        byte[] msgByte = new byte[msgLen];
        in_.read(msgByte, 0, msgLen);
        String requestMsg = new String(msgByte, StandardCharsets.UTF_8);

        socketRouter_.service(requestMsg, socket_);
      } catch ( IOException ioe ) {
        Logger logger = (Logger) getX().get("logger");
        if ( logger != null ) logger.error(ioe);
      }

    }
  }

  @Override
  public void execute(X x) {
    while ( true ) {
      try {
        byte[] msgLenByte = new byte[4];
        in_.read(msgLenByte, 0, 4);
        int msgLen = ByteBuffer.wrap(msgLenByte).getInt();
        byte[] msgByte = new byte[msgLen];
        in_.read(msgByte, 0, msgLen);
        String requestMsg = new String(msgByte, StandardCharsets.UTF_8);

        socketRouter_.service(requestMsg, socket_);
      } catch ( IOException ioe ) {
        Logger logger = (Logger) getX().get("logger");
        if ( logger != null ) logger.error(ioe);
      }

    }
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }

}
