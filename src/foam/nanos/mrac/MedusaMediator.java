/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketException;
import java.nio.channels.UnresolvedAddressException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import foam.core.FObject;
import foam.core.FoamThread;


// Manage connection between MM and MN
// This class should create before MedusaJournal being able to use.
// check single or multiple journal
// get Node from X and Node DAO should put in local
// TODO: implement ContextAwareSupport
public class MedusaMediator {
    //tcp connection
    //mapping strategies should in this class
    
    // StorePath represent file directory in MedusaNode.
    // Each StorePath should have a queue and each queue will have thread associated with it.
    // Thread will keep checking queue.
    // Send FObject to MedusaNode as soon as there is one.
    private final Map<String, LinkedBlockingQueue<FObject>> storePathQueueMap;
    
    private final Map<Long, Node> nodeMap =  new ConcurrentHashMap<Long, Node>();

    private final boolean isSsl = false;

    private int connectionTimeOutMilli = 5000;

    // Counter to count worker and receiver threads
    private AtomicInteger threadCounter;

    // Each Medusa Node has its own sender thread.
    // Todo: record it in the dao. Enable GUI to show status of Thread.
    final ConcurrentHashMap<Long, Sender> senderMap;
    // Each MN has its own message queue.
    final ConcurrentHashMap<Long, ArrayBlockingQueue<String>> messageSendingMap; 

    public LinkedBlockingQueue<FObject> registerStorePath(String storePath) {
        // Two diffrent DAO should not put data into same file.
        // Unless using SINGLE journal mode.
        if ( storePathQueueMap.containsKey(storePath) ) {
            throw new RuntimeException("StorePath duplicate: " + storePath);
        }

        storePathQueueMap.put(storePath, new LinkedBlockingQueue<FObject>());

        // Initial Connection.
        return null;
    }

    public MedusaMediator() {
        //TODO: get node and register connection
        this.storePathQueueMap = new ConcurrentHashMap<String, LinkedBlockingQueue<FObject>>();
        this.senderMap = new ConcurrentHashMap<Long, Sender>();
        this.messageSendingMap = new ConcurrentHashMap<Long, ArrayBlockingQueue<String>>();
        this.threadCounter = new AtomicInteger(0);
    }

    public synchronized boolean connect(long mnid, InetSocketAddress mnAddress) {
        //TODO: check if connection already exists.
        
        Socket socket = null;

        try {
            //TODO: log - create socket to server
            if ( isSsl ) {
                //TODO: create ssl socket
            } else {
                socket = new Socket();
            }
            
            // Set socket options.
            setSocketOptions(socket);
            socket.connect(mnAddress, connectionTimeOutMilli);
            initConnection(mnid, socket);
            return true;

        } catch ( UnresolvedAddressException e ) {
            System.out.println("Cannot open socket to server: " + mnid + " at address: " + mnAddress.getHostString() + "\n" + e.toString());
            closeSocket(socket);
            return false;
        } catch ( SocketException e ) {
            System.out.println("Cannot open socket to server: " + mnid + " at address: " + mnAddress.getHostString() + "\n" + e.toString());
            closeSocket(socket);
            return false;
        } catch ( IOException e ) {
            System.out.println("Cannot open socket to server: " + mnid + " at address: " + mnAddress.getHostString() + "\n" + e.toString());
            closeSocket(socket);
            return false;
        }
    }

    // Helper method to initial socket Connection
    // Sending initial metadata to collaborate each side.
    // Initial Sender and Receiver of this socket.
    private void initConnection(long mnid, Socket socket) {

    }

    // Helper method to set up socket options.
    private void setSocketOptions(Socket socket) throws SocketException {
        socket.setTcpNoDelay(true);
        socket.setKeepAlive(true);
        // socket.setSoTimeout();
    } 

    // Helper method to close a socket.
    private void closeSocket(Socket socket) {

        if ( socket == null ) return;

        try {
            socket.close();
        } catch ( IOException e ) {
            System.out.println("Exception while closing" + e.toString());
        }
    }

    public InetSocketAddress initialSocketAddress(long mnid) {
        return null;
    }

    // Each Sender and Receiver pair represent a MM to MN connection.
    /**
     * 
     * Send a message to MedusaNode as soon as there is one in the queue.
     */
    class Sender extends FoamThread {

        long mnId;
        Socket socket;
        Receiver receiver;
        volatile boolean running = true;
        PrintWriter writer;

        Sender(Socket socket, long mnId) {
            super("SendTo: " + mnId);
            this.mnId = mnId;
            this.socket = socket;
            receiver = null;

            // Make sure that it is able to get outputStream from socket
            try {
                this.writer = new PrintWriter(socket.getOutputStream());
            } catch ( IOException e ) {
                System.out.println("Unable to get outputStream from socket" + e.toString());
                closeSocket(this.socket);
                running = false;
            }
        }

        synchronized void setReceiver(Receiver receiver) {
            this.receiver = receiver;
        }

        synchronized boolean close() {
            System.out.println("Sender close for " + mnId);

            // Do not do close twice
            if ( this.running == true ) return this.running;

            this.running = false;
            closeSocket(socket);

            // Interrupt this thread.
            this.interrupt();
            // Should also close receiver since they are paired.

            senderMap.remove(this.mnId, this);
            threadCounter.decrementAndGet();
            return running;

        }

        synchronized void send(String output) throws IOException {
            this.writer.print(output);
            this.writer.flush();
        }

        @Override
        public void run() {

            try {
                while ( running ) {
                
                    try {
                        ArrayBlockingQueue<String> sendingQueue = messageSendingMap.get(this.mnId);
                        String request = sendingQueue.poll(1000, TimeUnit.MILLISECONDS);
                        if ( request != null ) {
                            send(request);
                        }
                    } catch ( InterruptedException e ) {
                        System.out.println("Interrupted while waiting for message on queue" + e);
                    }
                }
            } catch ( Exception e ) {
                //TODO: fault recover.
                System.out.println("Connection fail: " + this.mnId);
            }

            this.close();

            System.out.println("Sender thread dead: " + this.mnId);
        }
    }


    class Receiver extends FoamThread {
        Receiver(Socket socket, long mnId) {
            super("ReceiveFrom: " + mnId);
        }
    }

}