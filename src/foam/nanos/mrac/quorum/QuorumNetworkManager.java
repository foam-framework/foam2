/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

package foam.nanos.mrac.quorum;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import foam.core.AbstractFObject;
import foam.core.FObject;
import foam.core.FoamThread;
import foam.dao.DAO;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.mrac.ClusterNode;


public class QuorumNetworkManager extends AbstractFObject {

  QuorumName quorumName = null;

  //TODO: DO I need?
  int outputQueueSize = 10;

  ConcurrentHashMap<Long, Sender> instanceToSenderMap;
  ConcurrentHashMap<Long, ArrayBlockingQueue<QuorumMessage>> instanceToQueueMap;
  public ArrayBlockingQueue<QuorumMessage> receiveQueue;
  Object receiveQueueLock = new Object();

  volatile boolean isRunning = true;

  public QuorumMessage pollResponseQueue(long timeout, TimeUnit unit) throws InterruptedException {
    return this.receiveQueue.poll(timeout, TimeUnit.MICROSECONDS);
  }

  // Convert to Bytebuffer and put into send.
  public void send(long destinationId, QuorumMessage message) {

  }


  public void connect(Long instanceId, Socket sock) throws IOException {

  }

  public class Sender extends FoamThread {
    Long instanceId;
    Socket socket;
    Receiver receiver = null;
    volatile boolean isRunning = true;
    DataOutputStream outputter;


    public Sender(Long instanceId, Socket socket) {
      super("QuoromNetworkManager.Sender");
      this.instanceId = instanceId;
      this.socket = socket;
      try {
        this.outputter = new DataOutputStream(socket.getOutputStream());
      } catch ( IOException e ) {
        //TODO: log error.
        closeSocket(socket);
        // terminate this Sender
        this.isRunning = false;
      }
      //TODO: log success
    }

    synchronized void setReciever(Receiver receiver) {
      this.receiver = receiver;
    }

    synchronized void send(QuorumMessage message) throws IOException {
      String out = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify(message);
      byte[] bytes = out.getBytes();
      outputter.writeInt(bytes.length);
      outputter.write(bytes);
      outputter.flush();
    }

    synchronized void close() {
      if ( ! isRunning ) return;
      isRunning = false;

      closeSocket(socket);
      // Interrupt queue poll waiting.
      this.interrupt();
      if ( receiver != null ) receiver.close();
      instanceToSenderMap.remove(instanceId, this);
    }

    @Override
    public void run() {
      try {
        while ( isRunning ) {
          try {
            ArrayBlockingQueue<QuorumMessage> messageQueue = instanceToQueueMap.get(instanceId);
            if ( messageQueue == null ) {
              //TODO: log error
              break;
            }
            QuorumMessage message = messageQueue.poll(1000, TimeUnit.MICROSECONDS);
            send(message);

          } catch ( InterruptedException e ) {
            //TODO: log warningd
          }
        }
      } catch ( Exception e ) {
        //TODO: log error
      } finally {
        close();
      }
    }
  }

  class Receiver extends FoamThread {
    Long instanceId;
    Socket socket;
    volatile boolean isRunning = true;
    DataInputStream in;
    Sender sender;

    public Receiver(Long instanceId, Socket socket, Sender sender) {
      super("QuorumBetworkManager.Receiver");
      this.instanceId = instanceId;
      this.socket = socket;
      this.sender = sender;
      try {
        this.in = new DataInputStream(socket.getInputStream());
        socket.setSoTimeout(0);
      } catch ( IOException e ) {
        //TODO: log error.
        closeSocket(socket);
        // terminate this Sender
        this.isRunning = false;
      }
    }

    synchronized void close() {
      if ( ! isRunning ) return;
      isRunning = false;
      this.interrupt();
    }

    @Override
    public void run() {
      try {
        while ( isRunning ) {
          int messagelength = in.readInt();
          if ( messagelength <= 0 ) throw new IOException("Invalid packet length: " + messagelength);

          byte[] bytes = new byte[messagelength];
          in.readFully(bytes, 0, messagelength);
          String message = new String(bytes, "UTF-8");
          FObject obj = getX().create(JSONParser.class).parseString(message);
          if ( ! (obj instanceof QuorumMessage) ) {
            //TODO: log error.
            continue;
          }

        }
      } catch ( Exception e ) {
        //TODO: log exits
      } finally {
        //TODO: log finish.
        sender.close();
        closeSocket(socket);
      }
    }
  }

  public class Server extends FoamThread {

    public Server() {
      super("QuoromNetworkManager.Server");
    }

    @Override
    public void run() {
      InetSocketAddress addr;
      ServerSocket serverSocket = null;
      Socket client = null;
      int retry = 0;
      int totalRetry = 3;

      while ( isRunning && retry < totalRetry ) {
        try {
          serverSocket = new ServerSocket();
          serverSocket.setReuseAddress(true);
          //TODO: get from addr.
          DAO dao = (DAO) getX().get("clusterNodeDAO");
          ClusterNode clusterNode = (ClusterNode) dao.find(quorumName.getId());
          addr = new InetSocketAddress(clusterNode.getElectionIP(), clusterNode.getElectionPort());
          serverSocket.bind(addr);

          // Ideally thread should be keep inside this loop until isRunning == false;
          while ( isRunning ) {
            try {
              client = serverSocket.accept();
              client.setTcpNoDelay(true);
              client.setKeepAlive(true);
              client.setSoTimeout(5000);
              addConnection(client);
            } catch ( SocketTimeoutException e ) {
              //TODO: ignore socketTimeout.
            }

          }
          retry = 0;
        } catch ( IOException e ) {
          if ( ! isRunning ) {
            break;
          }
          retry++;
          // Close serverSocket, and it will reopen in next loop.
          closeServerSocket(serverSocket);
          closeSocket(client);
          try {
            Thread.sleep(2000);
          } catch ( InterruptedException ine ) {
            //TODO: log e
          }
        }
      }
      // If isRunning is equal to true at this point,
      // the server exits errorly.
      if ( isRunning ) {
        //TODO: log error.
        //TODO: close hold quorum service.
      }
      //close sockets.
      closeServerSocket(serverSocket);
      closeSocket(client);
    }

  }

  private void closeSocket(Socket socket) {
    if ( socket == null ) return;

    try {
      socket.close();
    } catch ( IOException e ) {
      //TODO: log error
    }
  }

  private void closeServerSocket(ServerSocket serverSocket) {
    if ( serverSocket == null ) return;

    try {
      serverSocket.close();
    } catch ( IOException e ) {
      //TODO: log error
    }
  }

  public void appendToReceiveQueue(QuorumMessage message) {
    // Only one thread can append message to queue at any giving time.
    synchronized ( receiveQueueLock ) {
      // It is ok to remove first one.
      // Because the algorithm will eventually elect a leader even if some machine have network packet loss.
      if ( receiveQueue.remainingCapacity() == 0 ) receiveQueue.remove();
      receiveQueue.add(message);
    }

  }

  public void appendToSendQueue(ArrayBlockingQueue<QuorumMessage> queue, QuorumMessage message) {
    synchronized ( queue ) {
      if ( queue.remainingCapacity() == 0 ) queue.remove();
      queue.add(message);
    }
  }

  public void sendToInstance(Long instanceId, QuorumMessage message) {
    if ( quorumName.getId() == instanceId ) {
      appendToReceiveQueue(message);
      return;
    }

    ArrayBlockingQueue<QuorumMessage> queue = instanceToQueueMap.get(instanceId);
    if ( queue == null ) {
      queue = instanceToQueueMap.put(instanceId, new ArrayBlockingQueue<QuorumMessage>(1));
    }
    appendToSendQueue(queue, message);
    maybeConnect(instanceId);
  }

  public void retryConnect() {
    for ( Long instanceId : instanceToQueueMap.keySet()) {
      maybeConnect(instanceId);
    }
  }

  synchronized boolean maybeConnect(Long instanceId) {
    //TODO: Get InetAddress from dao.
    if ( instanceToSenderMap.get(instanceId) != null ) {
      //TODO: log Election connection exists.
      return true;
    }

    Object obj = getX().get("clusterNodeDAO");
    if ( obj == null ) {
      //TODO: Log error.
      return false;
    }

    DAO dao = (DAO) obj;
    ClusterNode instance = (ClusterNode) dao.find(instanceId);

    if ( instance == null ) {
      //TODO: log error.
      return false;
    }

    try {
      InetSocketAddress addr = new InetSocketAddress(instance.getElectionIP(), instance.getElectionPort());
      Socket socket = new Socket();
      socket.setTcpNoDelay(true);
      socket.setKeepAlive(true);
      socket.setSoTimeout(2000);
      socket.connect(addr, 5000);

      return initialConnection(socket, instanceId, addr);
    } catch ( SocketException e ) {
      return false;
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return false;
    }

  }

  public synchronized boolean initialConnection(Socket socket, Long instanceId, InetSocketAddress addr) {
    DataInputStream in = null;
    DataOutputStream out = null;

    try {
      out = new DataOutputStream(new BufferedOutputStream(socket.getOutputStream()));

      QuorumMessage initialMessage = new QuorumMessage();
      initialMessage.setMessageType(QuorumMessageType.INITIAL);
      initialMessage.setDestinationInstance(instanceId);
      initialMessage.setSourceInstance(quorumName.getId());
      initialMessage.setSourceElectionIP(addr.getHostString());
      initialMessage.setSourceElectionPort(addr.getPort());

      String message = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).stringify(initialMessage);
      byte[] bytes = message.getBytes();
      out.writeInt(bytes.length);
      out.write(bytes);
      out.flush();

      in = new DataInputStream(new BufferedInputStream(socket.getInputStream()));
    } catch ( IOException e ) {
      closeSocket(socket);
      return false;
    }

    if ( instanceId > quorumName.getId() ) {
      closeSocket(socket);
      return false;
    }

    Sender sender = new Sender(instanceId, socket);
    Receiver receiver = new Receiver(instanceId, socket, sender);

    Sender oldSender = instanceToSenderMap.get(instanceId);
    if ( oldSender != null ) oldSender.close();

    instanceToSenderMap.put(instanceId, sender);
    instanceToQueueMap.putIfAbsent(instanceId, new ArrayBlockingQueue<QuorumMessage>(1));

    sender.start();
    receiver.start();
    return true;
  }

  public void addConnection(Socket socket) {
    QuorumMessage message = null;
    InetSocketAddress clientAddr;
    try {
      DataInputStream io = null;

      io = new DataInputStream(new BufferedInputStream(socket.getInputStream()));
      // Get message length.
      int messagelen = io.readInt();
      if ( messagelen < 0 ) {
        //TODO: handle error.
        throw new IOException("can not find message len");
      }

      byte[] bytes = new byte[messagelen];
      int rc = io.read(bytes);
      if ( rc != messagelen ) {
        throw new IOException("Illegal length");
      }

      // Convert bytes to String.
      String input = new String(bytes, "UTF-8");
      FObject request = getX().create(JSONParser.class).parseString(input);

      message = (QuorumMessage) request;

      clientAddr = new InetSocketAddress(message.getSourceElectionIP(), message.getSourceElectionPort());

    } catch ( IOException e ) {
      //TODO: Log error
      closeSocket(socket);
      return;
    }

    // Drop Connection.
    if ( message.getSourceInstance() < quorumName.getId() ) {
      Sender sender = instanceToSenderMap.get(message.getSourceInstance());
      if ( sender != null ) sender.close();

      closeSocket(socket);
      maybeConnect(message.getSourceInstance());
    } else {
      Sender sender = new Sender(message.getSourceInstance(), socket);
      Receiver receiver = new Receiver(message.getSourceInstance(), socket, sender);

      Sender oldSender = instanceToSenderMap.get(message.getSourceInstance());
      if ( oldSender != null ) oldSender.close();

      instanceToSenderMap.put(message.getSourceInstance(), sender);
      instanceToQueueMap.putIfAbsent(message.getSourceInstance(), new ArrayBlockingQueue<QuorumMessage>(1));

      sender.start();
      receiver.start();
    }

  }


}
