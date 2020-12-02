/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.app.AppConfig;
import foam.nanos.app.Mode;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.TimeUnit;

public class BenchmarkRunner
  extends    ContextAwareSupport
  implements ContextAgent
{
  public static String RUN         = "Run";
  public static String THREADCOUNT = "Threads";
  public static String OPS         = "Operations/s";
  public static String OPSPT       = "Operations/s/t";
  public static String MEMORY      = "Memory GB";
  public static String TOTAL       = "Total";
  public static String PASS        = "Pass";
  public static String FAIL        = "Fail";

  protected String    name_;
  protected int       threadCount_;
  protected Boolean   runPerThread_;
  protected Boolean   reverseThreads_;
  protected int       invocationCount_;
  protected Benchmark test_;
  protected List<Map<String, Object>> results_ = new ArrayList<Map<String, Object>>();

  // Builder pattern to avoid large constructor in the case
  // we want to add more variables to this test runner later.
  //
  // Generics were added to support inheritance if more
  // properties needed to be added to the builder class by
  // an inherited class
  public static class Builder<T extends Builder<T>>
    extends ContextAwareSupport
  {
    protected String    name_            = "foam.nanos.bench.BenchmarkRunner";
    protected int       threadCount_     = Runtime.getRuntime().availableProcessors();
    protected Boolean   runPerThread_    = false;
    protected Boolean   reverseThreads_  = false;
    protected int       invocationCount_ = 0;
    protected Benchmark test_;

    public Builder(X x) {
      setX(x);
    }

    public T setName(String val) {
      name_ = val;
      return (T) this;
    }

    public T setThreadCount(int val) {
      threadCount_ = val;
      return (T) this;
    }

    public T setInvocationCount(int val) {
      invocationCount_ = val;
      return (T) this;
    }

    public T setRunPerThread(Boolean val) {
      runPerThread_ = val;
      return (T) this;
    }

    public T setReverseThreads(Boolean val) {
      reverseThreads_ = val;
      return (T) this;
    }

    public T setBenchmark(Benchmark val) {
      test_ = val;
      return (T) this;
    }

    public BenchmarkRunner build() {
      return new BenchmarkRunner(getX(), this);
    }
  }

  protected BenchmarkRunner(X x, Builder<?> builder) {
    setX(x.put(BenchmarkRunner.class, this));
    name_            = builder.name_;
    threadCount_     = builder.threadCount_;
    runPerThread_    = builder.runPerThread_;
    reverseThreads_  = builder.reverseThreads_;
    invocationCount_ = builder.invocationCount_;
    test_            = builder.test_;
  }

  /**
   * GetName
   * @return the name used by the ThreadGroup
   */
  public String getName() {
    return name_;
  }

  /**
   * GetThreadCount
   * @return the thread count
   */
  public int getThreadCount() {
    return threadCount_;
  }

  /**
   * GetRunPerThread
   * Perform a run for each thread. Start the thread count at 1, and
   * incrementing until all threads are used for the last run.
   * @return
   */
  public Boolean getRunPerThread() {
    return runPerThread_;
  }

  /**
   * GetReverseThreads
   * Decrement threadcount from max threads down to 1 when RunPerThread is true.
   * @return
   */
  public Boolean getReverseThreads() {
    return reverseThreads_;
  }

  /**
   * GetInvocationCount
   * @return the invocation count
   */
  public int getInvocationCount() {
    return invocationCount_;
  }

  public String getResult() {
    return formatResults();
  }

  @Override
  public void execute(final X x) {
    Logger log = (Logger) x.get("logger");
    if ( log != null ) {
      log = new foam.nanos.logger.StdoutLogger();
    }
    final Logger logger = new PrefixLogger(new String[] { test_.getClass().getSimpleName() }, log);

    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == Mode.PRODUCTION ) {
      logger.warning("Script execution disabled in PRODUCTION");
      return;
    }
    logger.info("execute", test_.getClass().getSimpleName());

    int availableThreads = Math.min(Runtime.getRuntime().availableProcessors(), getThreadCount());
    int run = 1;
    int threads = 1;
    if ( reverseThreads_ ) {
        threads = availableThreads;
    }

    try {
      while ( true ) {
        final CountDownLatch latch = new CountDownLatch(threads);
        final AtomicLong pass = new AtomicLong();
        final AtomicLong fail = new AtomicLong();
        ThreadGroup group = new ThreadGroup(name_);
        Map stats = new HashMap<String, Object>();
        stats.put(RUN, run);
        stats.put(THREADCOUNT, threads);

        // set up the test
        logger.info("setup");
        test_.setup(x);

        // get start time
        long startTime = System.currentTimeMillis();

        // execute all the threads
        for ( int i = 0 ; i < threads ; i++ ) {
          final int tno = i;
          Thread thread = new Thread(group, new Runnable() {
              @Override
              public void run() {
                for ( int j = 0 ; j < invocationCount_ ; j++ ) {
                  try {
                    test_.execute(x);
                    pass.incrementAndGet();
                  } catch (Throwable t) {
                    fail.incrementAndGet();
                    Throwable e = t;
                    if ( t instanceof RuntimeException ) {
                      e = t.getCause();
                    }
                    logger.error(e.getMessage());
                    logger.debug(e);
                  }
                }
                // count down the latch when finished
                latch.countDown();
              }
            }) {
              @Override
              public String toString() {
                return getName() + "-Thread " + tno;
              }
            };
          // start the thread
          thread.start();
        }

        // wait until latch reaches 0
        latch.await();

        // calculate length taken
        // get number of threads completed and duration
        // print out transactions per second
        long  endTime  = System.currentTimeMillis();
        float complete = (float) (threads * invocationCount_);
        float duration = ((float) (endTime - startTime) / 1000.0f);
        stats.put(PASS, pass.get());
        stats.put(FAIL, fail.get());
        stats.put(TOTAL, pass.get() + fail.get());
        stats.put(OPS, String.format("%.02f", (complete / duration)));
        stats.put(OPSPT, String.format("%.02f", (complete / duration) / (float) threads));
        stats.put(MEMORY, String.format("%.02f", (((Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory())) / 1024.0 / 1024.0 / 1024.0)));

        logger.info("teardown");
        test_.teardown(x, stats);
        results_.add(stats);

        if ( getRunPerThread() ) {
          String results = formatResults();
          System.out.println(results);
          logger.info(results);

          if ( reverseThreads_ ) {
            threads--;
          } else {
            threads++;
          }

          if ( threads <= 0 || threads > availableThreads ) {
            break;
          }

          run++;
        } else {
          String results = formatResults();
          System.out.println(results);
          logger.info(results);
          break;
        }
      }
    } catch (Throwable t) {
      t.printStackTrace();
      logger.error(t);
    }
  }

  /**
   * Format the results as a CSV.
   */
  public String formatResults() {
    StringBuilder csv = new StringBuilder();
    csv.append(test_.getClass().getSimpleName());
    csv.append(",");
    csv.append(new java.util.Date().toString());
    csv.append("\n");

    if ( results_.size() == 0 ) {
      csv.append("no results\n");
      return csv.toString();
    }

    Map<String, Object> r = results_.get(0);

    int index = 0;
    for ( Map.Entry<String, Object> entry : r.entrySet() ) {
      index++;
      csv.append(entry.getKey());
      if ( index < r.entrySet().size() ) csv.append(",");
    }

    csv.append("\n");

    for ( Map<String, Object> result : results_ ) {
      index = 0;
      for ( Map.Entry<String, Object> entry : result.entrySet() ) {
        index++;
        Object val = entry.getValue();
        csv.append(val);
        if ( index < result.entrySet().size() ) csv.append(",");
      }
      csv.append("\n");
    }

    return csv.toString();
  }
}
