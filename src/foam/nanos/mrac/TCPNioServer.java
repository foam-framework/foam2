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
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;

import foam.core.AbstractFObject;
import foam.core.FObject;
import foam.core.FoamThread;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.nanos.NanoService;
import foam.nanos.box.NanoServiceRouter;
import foam.nanos.logger.Logger;

//Start a tcp service.
public class TCPNioServer extends AbstractFObject implements NanoService {


  protected TcpNioRouter router_ = null;
  protected Logger logger   = (Logger) getX().get("logger");
  protected Long clusterId = Long.parseLong(System.getProperty("CLUSTER"));
  //TODO: Do not hard code this field.
  // protected int maxConnectionPerClient = 50;

  // Record all register SocketChannels for a client.
  private final ConcurrentHashMap<InetAddress, Set<SocketChannel>> clientMap = new ConcurrentHashMap<InetAddress, Set<SocketChannel>>();

  private Acceptor acceptor;
  private Set<Processor> processors = new HashSet<Processor>();
  private ServerSocketChannel serverSocketChannel;
  private final int totalCores = Runtime.getRuntime().availableProcessors();
  private volatile AtomicBoolean isRunning = new AtomicBoolean(true);

  //TODO: start selector
  public void start() throws Exception {
    System.out.println("<><><><><><><<><>");
    X x = getX();
    if ( x == null ) throw new RuntimeException("Context no found.");
    DAO clusterDAO = (DAO) x.get("clusterNodeDAO");
    if ( clusterDAO == null ) throw new RuntimeException("clusterNodeDAO no found.");

    ClusterNode myself = (ClusterNode) clusterDAO.find(clusterId);
    if ( myself == null ) throw new RuntimeException("ClusterNode no found: " + clusterId);


    //TODO: do not hard coding following parameter.
    InetSocketAddress serverAddress = new InetSocketAddress(myself.getIp(), myself.getSocketPort());
    System.out.println("Tcp server open at: " + serverAddress);
    // int totalProcessors = totalCores * 1;
    // Double size of MM.
    int totalProcessors = totalCores * 2;
    for ( int i = 0 ; i < totalProcessors ; i++ ) {
      this.processors.add(new Processor(String.valueOf(i)));
    }

    this.serverSocketChannel = ServerSocketChannel.open();
    this.serverSocketChannel.socket().setReuseAddress(true);
    this.serverSocketChannel.socket().bind(serverAddress);
    this.serverSocketChannel.configureBlocking(false);

    acceptor = new Acceptor(this.serverSocketChannel, serverAddress, this.processors);

    // Start TCP server.
    // Make sure that thread starts once.
    for ( Processor processor : this.processors ) {
      if ( processor.getState() == Thread.State.NEW ) {
        processor.start();
      }
    }

    if ( acceptor.getState() == Thread.State.NEW ) {
      acceptor.start();
    }

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
      // ServerSocketChannel should only hook on ACCEPT event.
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
              System.out.println("aaaaaa");
              SocketChannel socketChannel = acceptChannel(key);

              if ( socketChannel != null ) {
                this.processors.get(curIndex % this.processors.size()).acceptSocketChannel(socketChannel);
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

        return socketChannel;
      } catch ( IOException e ) {
        //TODO: LOG
        removeSelectionKey(key);
        hardCloseSocketChannel(socketChannel);
      }
      return null;
    }

    protected void shutdown() {
      super.shutdown();
      // Close all processors.
      synchronized( this ) {
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

    private final String threadName;
    private final Queue<SocketChannel> acceptedSocketChannels;
    protected volatile AtomicBoolean isRunning = new AtomicBoolean(true);

    public Processor(String threadName) throws IOException {
      super("TCPSocketService.Processor-" + threadName);
      this.threadName = threadName;
      this.acceptedSocketChannels = new LinkedBlockingQueue<SocketChannel>();

    }

    public boolean acceptSocketChannel(SocketChannel socketChannel) {
      if ( isRunning.get() && this.acceptedSocketChannels.offer(socketChannel) ) {
        System.out.println("acceptSocketChannel");
        this.wakeup();
        return true;
      }
      return false;
    }

    @Override
    public void run() {
      try {
        while ( isRunning.get() ) {
          //select
          // System.out.println(threadName);
          configureNewConnections();
          select();
        }

        // Close connections.
        for ( SelectionKey key : selector.keys() ) {
          removeSelectionKey(key);
        }
        // Close accepted connections pending on the queue.
        SocketChannel socketChannel = acceptedSocketChannels.poll();
        while ( socketChannel != null ) {
          hardCloseSocketChannel(socketChannel);
          socketChannel = acceptedSocketChannels.poll();
        }
      } catch ( Exception e ) {
        //TODO: log ignore exceptions.
      }
    }

    private void select() {
      try {
        this.selector.select();

        Iterator<SelectionKey> iterator = selector.selectedKeys().iterator();

        while ( isRunning.get() && iterator.hasNext() ) {
          SelectionKey key = iterator.next();
          //Remove from selected Set.
          iterator.remove();

          if ( key.isValid() == false ) {
            removeSelectionKey(key);
            continue;
          }

          if ( key.isReadable() ) {
            processRequest(key);
          }
        }
      } catch ( IOException e ) {
        //TODO: LOG ignore error.
      }
    }

    private void configureNewConnections() {
      SocketChannel socketChannel = acceptedSocketChannels.poll();
      while ( isRunning.get() && socketChannel != null ) {
        SelectionKey key = null;
        try {
          key = socketChannel.register(this.selector, SelectionKey.OP_READ);
          // LenBuffer can be reused. Put into the context to make sure it is thread-safe.
          X x = getX().put("lenBuffer", ByteBuffer.allocate(4));
          key.attach(getX().put("lenBuffer", ByteBuffer.allocate(4)));

        } catch ( IOException e ) {
          removeSelectionKey(key);
          hardCloseSocketChannel(socketChannel);
        }
        socketChannel = acceptedSocketChannels.poll();
      }
    }


    // Entry to all servers in System.
    //TODO: change to multi-thread process.
    private void processRequest(SelectionKey key) throws IOException {
      System.out.println("processRequest method:");
      SocketChannel socketChannel = null;
      try {
        // Stop selecting.
        key.interestOps(0);

        socketChannel = (SocketChannel) key.channel();
        X x = (X) key.attachment();
        ByteBuffer lenbuffer = ByteBuffer.allocate(4);
        int rc = socketChannel.read(lenbuffer);

        if ( rc < 0 ) {
          throw new IOException("End of Stream");
        }

        // Read message length.
        int messageLen = -1;
        if ( lenbuffer.remaining() == 0 ) {
          lenbuffer.flip();
          messageLen = lenbuffer.getInt();
          lenbuffer.clear();
        }
        if ( messageLen < 0 ) throw new IOException("Len error " + messageLen);

        System.out.println(messageLen);
        // Read message.
        ByteBuffer message = ByteBuffer.allocate(messageLen);
        if ( socketChannel.read(message) < 0 ) throw new IOException("End of Stream");

        String requestString = null;

        if ( message.remaining() == 0 ) {
          message.flip();
          requestString = new String(message.array(), 0, messageLen, Charset.forName("UTF-8"));
          message.clear();
        }

        //TODO: log
        System.out.println(messageLen);
        System.out.println(requestString);

        // Deserialize json and assign to service.
        // Inject SelectionKey and SocketChannel into X.
        // Then, the FObject that created by this X can obtain injected values.
        x = x.put("selectionKey", key).put("socketChannel", socketChannel);
        FObject request = x.create(JSONParser.class).parseString(requestString);

        //TODO: Inject ReturnBox.

        if ( request == null ) {
          // logger.warning("Failed to parse request.", request);
          System.out.println("Failed to parse request.");
          return;
        }

        if ( ! ( request instanceof TcpMessage ) ) {
          System.out.println("Request was not a TcpMessage");
          logger.warning("Request was not a TcpMessage", request);
          return;
        }

        TcpMessage tcpMessage = (TcpMessage) request;
        tcpMessage.getLocalAttributes().put("x", x);

        System.out.println(tcpMessage.getServiceKey());
        getRouter().service(tcpMessage.getServiceKey(), tcpMessage);

      } catch ( IOException e ) {
        // When client reset. close Socket.
        //TODO: log socket close.
        e.printStackTrace();
        try {
          key.cancel();
        } catch ( Exception exception ) {
          // Log error
        }
        TCPNioServer.closeSocketChannel(socketChannel);
      } catch ( Exception e){
        //TODO: log or ignore.
      } finally {
        // if ( key.isValid() ) {
        //   // Resume READ selection.
        //   key.interestOps(SelectionKey.OP_READ);
        // }
      }
    }
  }

  public NanoServiceRouter getRouter() {
    if ( router_ == null )
      router_ = getX().create(TcpNioRouter.class);
    return router_;
  }

  // Waiting for Acceptor and all Processors finish work.
  public void join() throws InterruptedException {
    if ( this.acceptor != null ) this.acceptor.join();
    for ( Processor processor : this.processors) {
      processor.join();
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

  public static void removeSelectionKey(SelectionKey selectionKey) {
    if ( selectionKey == null )  return;
    try {
      selectionKey.cancel();
    } catch ( Exception e ) {
      //TODO: log ignore exception
    }
  }

}
