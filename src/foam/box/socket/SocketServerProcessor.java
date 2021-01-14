/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box.socket;

import foam.box.Box;
import foam.box.Message;
import foam.box.socket.SocketRouter;
import foam.core.ContextAgent;
import foam.core.ContextAware;
import foam.core.X;
import foam.lib.json.JSONParser;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;

import java.net.ServerSocket;
import java.net.Socket;
import java.io.BufferedOutputStream;
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

  /**
   * Decode the socket request stream, and pass to a SocketRouter.
   */
  public SocketServerProcessor(X x, Socket socket)
    throws IOException
  {
    setX(x);
    socket_ = socket;
    in_ = new DataInputStream(socket.getInputStream());
    out_ = new DataOutputStream(new BufferedOutputStream(socket.getOutputStream()));
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
    String pmKey = "SocketServerProcessor";
    String pmName = String.valueOf(socket_.getRemoteSocketAddress());;
    try {
      while ( true ) {
        PM pm = null;
        try {
          long sent = in_.readLong();
          PM p = PM.create(x, pmKey, pmName+":network");
          p.setStartTime(sent);
          p.log(x);

          pm = PM.create(x, pmKey, pmName+":execute");

          int length = in_.readInt();
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
            throw new RuntimeException("Received empty message. from: "+socket_.getRemoteSocketAddress());
          }
          Message msg = (Message) x.create(JSONParser.class).parseString(message);
          if ( msg == null ) {
            throw new IllegalArgumentException("Failed to parse. from: "+socket_.getRemoteSocketAddress()+", message: "+message);
          }
          pm.log(x);

          // NOTE: enable along with send and receive debug calls in SocketConnectionBox to monitor all messages.
          // logger_.debug("execute", "service", (String) msg.getAttributes().get("serviceKey"), message);

          socketRouter_.service(msg);
        } catch ( java.net.SocketTimeoutException e ) {
          continue;
        } catch ( java.io.IOException e ) {
          logger_.debug(e.getMessage());
          break;
        } catch ( Throwable t ) {
          // logger_.error(t);
          if ( pm != null ) pm.error(x, t);
          try {
            // TODO: abstract this into a SocketWriter as it's duplicated in SocketConnectionBox.js
            foam.box.RemoteException remote = new foam.box.RemoteException();
            remote.setId(t.getClass().getName());
            remote.setMessage(t.getMessage());
            if ( t instanceof foam.core.Exception ) {
              remote.setException((foam.core.Exception) t);
            }
            foam.box.RPCErrorMessage error = new foam.box.RPCErrorMessage();
            error.setData(remote);
            foam.box.Message reply = new foam.box.Message();
            reply.setObject(error);

            foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
            formatter.setX(x);
            formatter.output(reply);
            String replyString = formatter.builder().toString();
            byte[] replyBytes = replyString.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            synchronized ( out_ ) {
              out_.writeLong(System.currentTimeMillis());
              out_.writeInt(replyBytes.length);
              out_.write(replyBytes);
              out_.flush();
            }
            logger_.error("Reply with error.", t);
          } catch ( Throwable th ) {
            logger_.error("Failed to reply with error.", t, th);
          }
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
