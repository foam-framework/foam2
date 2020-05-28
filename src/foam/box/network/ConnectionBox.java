/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box.network;

import foam.core.X;
import foam.core.FObject;
import foam.core.ContextAware;
import foam.box.Box;
import foam.box.Message;
import foam.lib.json.Outputter;
import foam.lib.json.JSONParser;

import java.net.Socket;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.OutputStreamWriter;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import foam.nanos.logger.Logger;

public class ConnectionBox
  extends Thread
  implements Box, ContextAware
{

  protected X x_;
  protected Socket socket_;
  protected InputStream in_;
  protected OutputStream out_;
  protected String host_;
  protected int port_;
  protected Map<Long, Box> replayBoxMap = Collections.synchronizedMap(new HashMap<Long, Box>());

  public ConnectionBox(X x, Socket socket, String host, int port)
    throws IOException
  {
    x_ = x;
    socket_ = socket;

    out_ = socket.getOutputStream();
    in_ = socket.getInputStream();

    host_ = host;
    port_ = port;

    ((TCPSocketMgr) x.get("SocketMgr")).add(this);
  }

  public void setHost(String host) {
    host_ = host;
  }

  public String getHost() {
    return host_;
  }

  public void setPort(int port) {
    port_ = port;
  }

  public int getPort() {
    return port_;
  }

  public void setX(X x) {
    x_ = x;
  }

  public X getX() {
    return x_;
  }

  @Override
  public void run()
  {
    try {
      while ( true ) {
        byte[] msgLenByte = new byte[4];
        in_.read(msgLenByte, 0, 4);
        int msgLen = ByteBuffer.wrap(msgLenByte).getInt();
        byte[] msgByte = new byte[msgLen];
        in_.read(msgByte, 0, msgLen);
        String responseMsg = new String(msgByte, StandardCharsets.UTF_8);

        Message response = (Message) getX().create(JSONParser.class).parseString(responseMsg);
        Long syncBoxId = (Long) response.getAttributes().get("syncBoxId");
        Box replayBox = replayBoxMap.get(syncBoxId);
        replayBox.send(response);
      }
    } catch ( Exception e ) {
      Logger logger = (Logger) getX().get("logger");
      if ( logger != null ) logger.error(e);
    }
  }

  @Override
  public synchronized void send(Message msg) {

    Box replayBox = (Box) msg.getAttributes().get("replyBox");
    Long syncBoxId = (Long) msg.getAttributes().get("syncBoxId");
    replayBoxMap.put(syncBoxId, replayBox);

    msg.getAttributes().put("replyBox", new SocketReplyBox());
    try {
      Outputter outputter = new Outputter(getX()).setPropertyPredicate(new foam.lib.NetworkPropertyPredicate());
      String message = outputter.stringify(msg);
      byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
      int messageSize = messageBytes.length;
      ByteBuffer requestBuffer = ByteBuffer.allocate(4+messageSize);
      requestBuffer.putInt(messageSize).put(messageBytes);
      out_.write(requestBuffer.array(), 0, 4+messageSize);
      out_.flush();
    } catch ( Exception e ) {
      Logger logger = (Logger) getX().get("logger");
      if ( logger != null ) logger.error(e);
      ((TCPSocketMgr) getX().get("SocketMgr")).remove(this);
    }
  }

}
