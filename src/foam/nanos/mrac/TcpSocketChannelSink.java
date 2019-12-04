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

import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.json.Outputter;

public class TcpSocketChannelSink extends AbstractSink {
  
  SelectionKey key;
  SocketChannel socketChannel;
  // This field use to determine if this sink is available to use.
  // We currently do not support removing a sink from listen_.
  // Once socket closed, this sink will still be picked while doing put and remove operation.
  boolean isClose = false;
  
  protected int writeWithPrefix(String source, String prefix) {
    return write(prefix + "(" + source + ")");
  }
  
  protected int write(String source) {
    byte[] bytes = source.getBytes(Charset.forName("UTF-8"));
    ByteBuffer byteBuffer = ByteBuffer.allocate(4 + bytes.length);
    byteBuffer.putInt(bytes.length);
    byteBuffer.put(bytes);
    byteBuffer.flip();
    int len = write(byteBuffer);
    byteBuffer.clear();
    return len;
  }
  
  
  protected synchronized int write(ByteBuffer source) {
    try {
      return this.getSocketChannel().write(source);
    } catch ( IOException e ) {
      // Close socket when IOException occurs.
      // Client side should sense this. And re-send sink cmd.
      System.out.println(e);
      handleFailure();
      return -1;
    }
  }
  
  @Override
  public void put(Object obj, foam.core.Detachable sub) {
    if ( isClose ) return;
    String out = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify((FObject) obj);
    writeWithPrefix(out, "p");
    
  }
  
  @Override
  public void remove(Object obj, foam.core.Detachable sub) {
    if ( isClose ) return;
    String out = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify((FObject) obj);
    writeWithPrefix(out, "r");
  }
  
  public synchronized void handleFailure() {
    if ( ! isClose ) return;
    TCPNioServer.removeSelectionKey(getSelectionKey());
    TCPNioServer.hardCloseSocketChannel(getSocketChannel());
    isClose = true;
  }
  
  public void setKey(SelectionKey key) {
    this.key = key;
  }
  
  public SelectionKey getSelectionKey() {
    if ( key == null ) {
      key = (SelectionKey) getX().get("selectionKey");
    }
    //TODO: handle key == null exception.
    return key;
  }
  
  public void setSocketChannel(SocketChannel socketChannel) {
    this.socketChannel = socketChannel;
  }
  
  public SocketChannel getSocketChannel() {  
    if ( socketChannel == null ) {
      socketChannel = (SocketChannel) getX().get("socketChannel");
    }
    return socketChannel;
  }
}