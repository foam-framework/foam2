/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/
package foam.nanos.mrac;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.SocketChannel;
import java.nio.charset.Charset;

import foam.box.Box;
import foam.box.Message;
import foam.core.AbstractFObject;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.json.Outputter;

// Each Request generate its own box. So this class should be thread-safe in theory.
// This SocketChannel can not be re-use by client,
// because this Box is used to listen to PUT and REMOVE DAO operations.
// Because we do not have "remove listened sink" method on DAO, client
// should not send second command via this SocketChannel.
// But client can close the socket channel.
public class TcpSocketChannelSinkBox extends TcpSocketChannelReturnBox {
  
  @Override
  public void send(Message msg) {
    System.out.println("sendback");
    
    String out = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify(msg);
    byte[] bytes = out.getBytes(Charset.forName("UTF-8"));
    ByteBuffer byteBuffer = ByteBuffer.allocate(4 + bytes.length);
    byteBuffer.putInt(bytes.length);
    byteBuffer.put(bytes);
    byteBuffer.flip();
    send(byteBuffer);
    byteBuffer.clear();
  }
  
}