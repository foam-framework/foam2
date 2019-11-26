/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.Set;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import foam.core.AbstractFObject;
import foam.core.FoamThread;
import foam.nanos.NanoService;

public class TCPSocketService extends AbstractFObject implements NanoService {


    //TODO: Do not hard code this field.
    protected int maxConnectionPerClient = 50;

    // Record all register SocketChannels for a client.
    private final ConcurrentHashMap<InetAddress, Set<SocketChannel>> clientMap = new ConcurrentHashMap<InetAddress, Set<SocketChannel>>();

    //TODO: start selector
    public void start() throws Exception {

    }

    private int getClientConnection(InetAddress ip) {
        if ( clientMap.get(ip) == null ) return 0;
        return clientMap.get(ip).size();
    }

    /**
     * Abstract common java.nio.channels.Selector codes.
     */
    private abstract class AbstractSelector extends FoamThread {

        protected final Selector selector;
        protected volatile AtomicBoolean isRunning = new AtomicBoolean(true);

        public AbstractSelector(String name) throws IOException {
            // Allows JVM to shutdown.
            super(name, true);
            this.selector = Selector.open();
        }

        public void wakeup() {
            this.selector.wakeup();
        }

        protected void close() {
            try {
                this.selector.close();
            } catch ( IOException e ) {
                //TODO: LOG
            }
        }

        protected boolean isRunning() {
            return isRunning.get();
        }

        protected void shutdown() {
            isRunning.set(false);
        }

    }

    /**
     * Listen on port and establish new connection.
     * Each instance should only have one instance running. 
     * An Acceptor is a kinde of AbstractSelector
     */
    private class Acceptor extends AbstractSelector {

        private final ServerSocketChannel acceptSocketCahnnel;
        private final SelectionKey acceptSelectionKey;
        private final List<Processor> processors;
        private final Iterator<Processor> processorIterator;

        public Acceptor(ServerSocketChannel serverSocketChannel, InetSocketAddress address, Set<Processor> processors) throws IOException {
            super("TCPSocketService.Acceptor: " + address.toString());
            this.acceptSocketCahnnel = serverSocketChannel;
            this.acceptSelectionKey = serverSocketChannel.register(this.selector, SelectionKey.OP_ACCEPT);
            this.processors = Collections.unmodifiableList(new ArrayList<Processor>(processors));
            this.processorIterator = this.processors.iterator();
        }

        @Override
        public void run() {
            try {
                int curIndex = 0;
                while ( isRunning() ) {
                    this.selector.select();
                    Iterator<SelectionKey> keys = this.selector.selectedKeys().iterator();
                    while ( isRunning() && keys.hasNext() ) {
                        SelectionKey key = keys.next();
                        // Remove from collection. Register into Processor later.
                        keys.remove();

                        if ( key.isAcceptable() ) {
                            SocketChannel socketChannel = acceptChannel(key);
                            
                            if ( socketChannel != null ) {
                                this.processors.get(curIndex % this.processors.size()).registerSocketChannel(socketChannel);
                            } else {
                                //TODO: LOG error.
                            }
                        } else {
                            //TODO: LOG accept error.
                        }
                    }
                }
            } catch ( Exception e ) {
                //TODO: LOG ignore exception.
            }
        }

        protected SocketChannel acceptChannel(SelectionKey key) {
            ServerSocketChannel serverSocketChannel = (ServerSocketChannel) key.channel();
            SocketChannel socketChannel = null;
            try {
                socketChannel = serverSocketChannel.accept();
                
                // Configure SocketChannel.
                socketChannel.configureBlocking(false);
                socketChannel.socket().setTcpNoDelay(true);
                socketChannel.socket().setKeepAlive(true);

                InetAddress ip = socketChannel.socket().getInetAddress();
                int currentConnection = getClientConnection(ip);
                if ( currentConnection >= maxConnectionPerClient )
                    throw new IOException("Connections from " + ip.toString() + " is greater than " + maxConnectionPerClient);

                return socketChannel;
            } catch ( IOException e ) {
                //TODO: LOG 
                // Hard close SocketChannel.
                hardCloseSocketChannel(socketChannel);
            }
            return null;
        }

        protected void shutdown() {
            super.shutdown();
            // Close all processors.
            synchronized(this) {
                for ( Processor p : processors ) {
                    p.shutdown();
                }
            }
        }

    }

    /** 
     * Processor
     */
    private class Processor extends AbstractSelector {

    }

    public static void removeSelectionKey(SelectionKey key) {
        try {
            key.cancel();
        } catch ( Exception e ) {
            //TODO: LOG
        }
    }

    public static void closeSocketChannel(SocketChannel socketChannel) {
        if ( socketChannel == null ) return;

        // Do not close a socketChannel twice.
        if ( ! socketChannel.isOpen() ) return;

        try {
            socketChannel.socket().shutdownOutput();
            socketChannel.socket().shutdownInput();
            socketChannel.socket().close();
            socketChannel.close();
        } catch ( IOException e ) {
            //TODO: LOG
        }
    }

    public static void hardCloseSocketChannel(SocketChannel socketChannel) {
        if ( socketChannel == null ) return;

        try {
            socketChannel.socket().setSoLinger(true, 0);
        } catch ( SocketException e ) {
            //TODO: LOG
        }
        closeSocketChannel(socketChannel);
    }
}