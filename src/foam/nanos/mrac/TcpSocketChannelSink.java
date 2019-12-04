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

import foam.dao.AbstractSink;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.json.Outputter;

/**
* Serialize object and write into a SocketChannel.
* The class is not thread-safe.
* Make sure that only one thread can write into SocketChannelSink at a moment.
*/
//TODO: model this class
public class TcpSocketChannelSink extends AbstractSink {
    
    SelectionKey key;
    SocketChannel socketChannel;
    // This field use to determine if this sink is available to use.
    // We currently do not support removing a sink from listen_.
    // Once socket closed, this sink will still be picked while doing put and remove operation.
    boolean isClose = false;
    
    protected int writeWithPrefix(String source, String prefix) throws IOException {
        return write(prefix + "(" + source + ")");
    }

    protected int write(String source) throws IOException {
        byte[] bytes = source.getBytes(Charset.forName("UTF-8"));
        ByteBuffer byteBuffer = ByteBuffer.allocate(4 + bytes.length);
        byteBuffer.putInt(bytes.length);
        byteBuffer.put(bytes);
        byteBuffer.flip();
        int len = write(byteBuffer);
        byteBuffer.clear();
        return len;
    }

    protected int write(ByteBuffer source) throws IOException {
        return this.getSocketChannel().write(source);
    }
    
    @Override
    public void put(Object obj, foam.core.Detachable sub) {
        if ( ! isClose ) return;
        try {
            String out = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify(obj);
            writeWithPrefix(out, "p");
        } catch ( IOException e ) {
            // Close socket when IOException occurs.
            // Client side should sense this. And re-send sink cmd.
            handleFailure();
        }
    }

    @Override
    public void remove(Object obj, foam.core.Detachable sub) {
        if ( ! isClose ) return;
        try {
            String out = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify(obj);
            writeWithPrefix(out, "r");
        } catch ( IOException e ) {
            // Close socket when IOException occurs.
            // Client side should sense this. And re-send sink cmd.
            handleFailure();
        } 
    }

    public synchronized void handleFailure() {
        if ( ! isClose ) return;
        TCPNioServer.removeSelectionKey(key);
        TCPNioServer.hardCloseSocketChannel(socketChannel);
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