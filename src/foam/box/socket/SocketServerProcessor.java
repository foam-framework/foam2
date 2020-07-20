/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box.socket;

import foam.box.Box;
import foam.box.Message;
import foam.core.ContextAgent;
import foam.core.ContextAware;
import foam.core.X;
import foam.lib.json.JSONParser;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import foam.nanos.network.SocketRouter;
import foam.nanos.pm.PM;

import java.net.ServerSocket;
import java.net.Socket;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

public class SocketServerProcessor
  extends Thread
  implements ContextAware, ContextAgent
{
  protected X x_;
  protected Socket socket_;
  protected SocketRouter socketRouter_;
  protected DataInputStream in_;
  protected DataOutputStream out_;
  protected Logger logger_;

  public SocketServerProcessor(X x, Socket socket)
    throws IOException
  {
    setX(x);
    socket_ = socket;
    in_ = new DataInputStream(socket.getInputStream());
    out_ = new DataOutputStream(socket.getOutputStream());

    logger_ = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        socket.getRemoteSocketAddress()
      }, (Logger) getX().get("logger"));

    X y = getX()
      .put("socketInputStream", in_)
      .put("socketOutputStream", out_)
      .put("socket", socket_);

    socketRouter_ = new SocketRouter(y);
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }

  public void execute(X x) {
    // NOTE: using SocketServer as PMs only take FObject classInfo
    foam.core.ClassInfo pmClass = SocketServer.getOwnClassInfo();
    String pmName = String.valueOf(socket_.getRemoteSocketAddress())+":network";
    try {
      while ( true ) {
        try {
          int length = in_.readInt();
          long sent = in_.readLong();
          PM pm = PM.create(x, pmClass, pmName);
          pm.setStartTime(new java.util.Date(sent));
          pm.log(x);
          byte[] bytes = new byte[length];
          StringBuilder data = new StringBuilder();
          int total = 0;
          while ( true ) {
            int bytesRead = 0;
            try {
              bytesRead = in_.read(bytes, 0, length - total);
              if ( bytesRead == -1 ) {
               logger_.debug("eof,-1");
               break;
             }
           } catch ( java.io.EOFException | java.net.SocketException e ) {
              logger_.debug(e.getMessage());
              break;
            }
            data.append(new String(bytes, 0, bytesRead, StandardCharsets.UTF_8));
            total += bytesRead;
            if ( total == length ) {
              break;
            }
            if ( total > length ) {
              logger_.error("read too much", length, total);
              break;
            }
          }
          String message = data.toString();
          if ( foam.util.SafetyUtil.isEmpty(message) ) {
            logger_.error("null message from", socket_.getRemoteSocketAddress());
            throw new RuntimeException("Received empty message.");
          }
          // logger_.debug("message", message);
          Message msg = (Message) x.create(JSONParser.class).parseString(message);
          if ( msg == null ) {
            int chunk = Math.max(0, Math.min(length, 200) - 1);
            String start = new String(java.util.Arrays.copyOfRange(bytes, 0, chunk), StandardCharsets.UTF_8);
            String end = new String(java.util.Arrays.copyOfRange(bytes, length-chunk, length-1), StandardCharsets.UTF_8);
            logger_.warning("Failed to parse", "message", socket_.getRemoteSocketAddress(), length, start, "...", end);
            throw new RuntimeException("Failed to parse.");
          // } else {
          //   // TODO: for debugging
          //   int chunk = Math.max(0, Math.min(length, 200) - 1);
          //   String start = new String(java.util.Arrays.copyOfRange(bytes, 0, chunk), StandardCharsets.UTF_8);
          //   String end = new String(java.util.Arrays.copyOfRange(bytes, length-chunk, length-1), StandardCharsets.UTF_8);
          //   logger_.debug("bytes", socket_.getRemoteSocketAddress(), length, start, "...", end);
          }
          socketRouter_.service(msg);
        } catch ( java.net.SocketTimeoutException e ) {
          continue;
        } catch ( java.io.IOException e ) {
          logger_.debug(e.getMessage());
          break;
        } catch ( Throwable t ) {
          // TODO: Alarm
          // TODO: write error to output stream
          // REVIEW: remove this catch when understand all exceptions
          logger_.error(t);
          break;
        }
      }
    } finally {
      try {
        if ( socket_ != null ) {
          logger_.debug("socket,close");
          socket_.close();
        }
      } catch ( java.io.IOException e ) {
        // nop
      }
    }
  }
}
