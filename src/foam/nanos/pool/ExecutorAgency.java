/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pool;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ThreadFactory;

import foam.core.AbstractFObject;
import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.ContextAgentRunnable;
import foam.core.X;

//TODO: extract AbstractFixedThreadPool.
//This Class is not thread-safe.
public class ExecutorAgency extends AbstractFObject implements Agency {

    private ExecutorService executorService;

    private int totalThreads;

    private volatile boolean isRunning;

    private final static int totalCores = Runtime.getRuntime().availableProcessors();

    private final String prefix;

    public ExecutorAgency(X x) {
        this(x, "");
    }

    public ExecutorAgency(X x, int totalThreads, String prefix) {
        super(x);
        this.totalThreads = totalThreads;
        this.prefix = prefix;
        init();
    }

    public ExecutorAgency(X x, String prefix) {
        this(x, totalCores*2, prefix);
    }

    public void submit(X x, ContextAgent agent, String description) {

        if ( ! ( agent instanceof Work ) ) {
            throw new IllegalArgumentException("Agent should be a type of Work.");
        }
        
        Work work = (Work) agent;

        if ( isRunning == false ) {
            work.afterExecute(x);
            return;
        }

        ScheduleContextAgentRunnable runnable = new ScheduleContextAgentRunnable(x, work, description);

        try {
            executorService.execute(runnable);
        } catch ( RejectedExecutionException e ) {
            //TODO: LOG
            work.afterExecute(x);
        }
    }

    public void init() {
        executorService = Executors.newFixedThreadPool(totalThreads, new ThreadFactory() {
            final AtomicInteger threadNumber = new AtomicInteger(1);
            
            public Thread newThread(Runnable runnable) {
                Thread thread = new Thread(
                    Thread.currentThread().getThreadGroup(),
                    runnable,
                    prefix + "-" + threadNumber.getAndIncrement(),
                    0
                );
                // Thread don not block server from shut down.
                thread.setDaemon(true);
                thread.setPriority(Thread.NORM_PRIORITY);
                return thread;
            }
        });
        isRunning = true;
    }

    public void shutdown() {
        isRunning = false;
        executorService.shutdown();
    }


    public abstract class Work implements ContextAgent {

        @Override
        public abstract void execute(X x);

        public void afterExecute(X x) {

        }
    }

    public class ScheduleContextAgentRunnable extends ContextAgentRunnable {
        
        public ScheduleContextAgentRunnable(X x, ContextAgent agent, String description) {
            super(x, agent, description);
            if ( ! ( agent instanceof Work) ) {
                throw new IllegalArgumentException("Agent should be a type of Work.");
            }
        }
        @Override
        public void run() {
            Work work = (Work) this.agent_;
            try {
                if ( isRunning ) {
                    work.execute(x_);
                }
                work.afterExecute(x_);
            } catch ( Exception e ) {
                //LOG error.
                work.afterExecute(x_);
            }

        }
    }


}