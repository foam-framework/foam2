/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/
package foam.nanos.medusa;

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
//TODO: need common close method for all box using SocketChannel?
// Do not catch IOException in this class. Let caller handle it.
public class TcpSocketChannelReturnBox extends AbstractFObject implements Box {

  SelectionKey key;
  SocketChannel socketChannel;
  protected int sizeBytes = 4;

  public void send(Message msg) {
    try {
      doSend(msg);
      // After sending back response, the SocketChannel should re-register READ in selector.
      // So that this SocketChannel can be re-use by client.
      resumeSelection();
    } catch ( IOException e ) {
      //Re-throw IOException.
      throw new RuntimeException(e);
    }

  }

  public void doSend(Message msg) throws IOException {
    String out = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify(msg);
    byte[] bytes = out.getBytes(Charset.forName("UTF-8"));
    send(bytes);
  }

  //Do not filp ByteBuffer before pass into this method.
  public void send(ByteBuffer byteBuffer) throws IOException {
    getSocketChannel().write(byteBuffer);
  }

  public void send(byte[] bytes) throws IOException {
    ByteBuffer byteBuffer = ByteBuffer.allocate(sizeBytes + bytes.length);
    byteBuffer.putInt(bytes.length);
    byteBuffer.put(bytes);
    byteBuffer.flip();
    send(byteBuffer);
    byteBuffer.clear();
  }

  private void resumeSelection() {
    if ( getSelectionKey().isValid() ) {
      getSelectionKey().interestOps(SelectionKey.OP_READ);
    }
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
