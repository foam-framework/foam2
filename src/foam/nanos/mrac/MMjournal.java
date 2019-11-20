package foam.nanos.mrac;

import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import foam.core.FObject;
import foam.core.FoamThread;

// Make sure that this class sould only have one instance in single journal mode.
// In multiple journal mode. each JDAO will have it's own instance.
// can simple get put to MedusaMediator
// Make sure MM initial before initial of this class.
public class MMjournal {

    private String storePath;
    private final LinkedBlockingQueue<FObject> outgoingQueue = new LinkedBlockingQueue<FObject>();

    private JournalSender journalSender;

    public MMjournal(String storePath) {
        this.storePath = storePath;
        this.journalSender = new JournalSender();
        // Allows the JVM to shutdown even if this thread is still running.
        this.journalSender.setDaemon(true);
        this.journalSender.start();

        //TODO: register journal info to MmManager. So that MmManager are able to find info
        //from MM gget outgoingQueue instance

        
    }

    //TODO: think if this class acctually need?
    class JournalSender extends FoamThread {
        
        volatile boolean stop;
        // TODO: Create Network Manager

        JournalSender() {
            super("Sender");
            this.stop = false;
        }

        public void run() {
            while ( ! stop ) {
                try {
                    FObject obj = outgoingQueue.poll(3000, TimeUnit.MILLISECONDS);
                    if ( obj == null ) {
                        continue;
                    }

                    process(obj);
                } catch ( InterruptedException e ) {
                    break;
                }
            }

            //TODO: LOG Sender id down
        }

        void process(FObject obj) {
            //TODO: processing data in outgoingQueue and send to ready to 
            System.out.println("sender process");
        }
    }

}