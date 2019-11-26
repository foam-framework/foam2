package foam.core;

import foam.nanos.logger.Logger;

public class FoamThread extends Thread {

    private static final Logger LOG = null;

    public FoamThread(String threadName) {
        this(threadName, true);
    }

    public FoamThread(String threadName, Runnable runnable) {
        this(threadName, runnable, true);
    }

    public FoamThread(String threadName, boolean isDaemon) {
        super(threadName);
        setDaemon(isDaemon);
        setUncaughtExceptionHandler(uncaughtExceptionalHandler);
    }

    public FoamThread(String threadName, Runnable runnable, boolean isDaemon) {
        super(runnable, threadName);
        setDaemon(isDaemon);
        setUncaughtExceptionHandler(uncaughtExceptionalHandler);
    }

    private UncaughtExceptionHandler uncaughtExceptionalHandler = new UncaughtExceptionHandler() {

        @Override
        public void uncaughtException(Thread thread, Throwable e) {
            handleException(thread.getName(), e);
        }
    };

    protected  void handleException(String threadName, Throwable e) {
        // TODO: Log exception
        // LOG Exception occurred from thread threadName, e
    }

    public static FoamThread daemon(String threadName, Runnable runnable) {
        return new FoamThread(threadName, runnable, true);
    }

    public static FoamThread nonDaemon(String threadname, Runnable runnable) {
        return new FoamThread(threadname, runnable, false);
    }
}