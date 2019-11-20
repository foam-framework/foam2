package foam.nanos.mrac;

import java.net.InetSocketAddress;
import java.net.Socket;

import foam.core.FObject;
import foam.core.FoamThread;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.Map;


// Manage connection between MM and MN
// check single or multiple journal
// get Node from X and Node DAO should put in local
public class MedusaMediator {
    //tcp connection
    //mapping strategies should in this class
    
    // StorePath represent file directory in MedusaNode.
    // Each StorePath should have a queue and each queue will have thread associated with it.
    // Thread will keep checking queue.
    // Send FObject to MedusaNode as soon as there is one.
    private final Map<String, LinkedBlockingQueue<FObject>> storePathQueueMap;
    
    private final Map<Long, Node> nodeMap =  new ConcurrentHashMap<Long, Node>();

    /*
     *
     */
    final ConcurrentHashMap<Long, Sender> senderMap;

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
    }

    public synchronized boolean connect() {
        return false;
    }

    public InetSocketAddress initialSocketAddress(long mnid) {
        return null;
    }

    
    /**
     * 
     * Send a message to MedusaNode as soon as there is one in the queue.
     */
    class Sender extends FoamThread {

        Socket socket;
        volatile boolean running = true;

        Sender(Socket sock, long mnId) {
            super("SendTo: " + mnId);
        }

    }


}