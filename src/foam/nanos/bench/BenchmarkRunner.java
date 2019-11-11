/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.logger.Logger;

import java.util.*;
import java.util.concurrent.CountDownLatch;

public class BenchmarkRunner
  extends ContextAwareSupport
  implements ContextAgent
{
  protected String    name_;
  protected int       threadCount_;
  protected Boolean   runPerThread_;
  protected Boolean   reverseThreads_;
  protected int       invocationCount_;
  protected Benchmark test_;
  protected List<Map<String, Object>> results_ = new ArrayList<Map<String, Object>>();

  public static String RUN = "Run";
  public static String THREADCOUNT = "Threads";
  public static String OPS = "Operations/s";
  public static String OPSPT = "Operations/s/t";
  public static String MEMORY = "Memory MB";

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
      return new BenchmarkRunner(getX(),this);
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
    Logger logger = (Logger) x.get("logger");
    if ( logger != null ) {
      logger.info(this.getClass().getSimpleName(), "execute", test_.getClass().getSimpleName());
    }

    int availableThreads = Runtime.getRuntime().availableProcessors();
    int run = 1;
    threadCount_ = availableThreads;
    if ( runPerThread_ ) {
      threadCount_ = 1;
      if ( reverseThreads_ ) {
        threadCount_ = availableThreads;
      }
    }

    try {
      while ( true ) {
        // create CountDownLatch and thread group equal
        final CountDownLatch latch = new CountDownLatch(threadCount_);
        ThreadGroup group = new ThreadGroup(name_);
        Map stats = new HashMap<String, Object>();
        stats.put(RUN, run);
        stats.put(THREADCOUNT, threadCount_);

        // set up the test
        test_.setup(x);

        // get start time
        long startTime = System.currentTimeMillis();

        // execute all the threads
        for (int i = 0; i < threadCount_; i++) {
          final int tno = i;
          Thread thread = new Thread(group, new Runnable() {
              @Override
              public void run() {
                for (int j = 0; j < invocationCount_; j++) {
                  test_.execute(x);
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
        float complete = (float) (threadCount_ * invocationCount_);
        float duration = ((float) (endTime - startTime) / 1000.0f);

        stats.put(OPS, (complete / duration));
        stats.put(OPSPT, (complete / duration) / (float) threadCount_);
        stats.put(MEMORY, (((Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory())) / 1024.0 / 1024.0));

        test_.teardown(x, stats);
        results_.add(stats);

        if ( runPerThread_ ) {
          String results = formatResults();
          System.out.println(results);
          logger.info(results);

          if ( reverseThreads_ ) {
            threadCount_--;
          } else {
            threadCount_++;
          }
          if ( threadCount_ <= 0 ||
               threadCount_ > availableThreads ) {
            break;
          }
          run++;
        } else {
          String results = formatResults();
          System.out.println(results);
          if ( logger != null ) {
            logger.info(results);
          }
          break;
        }
      }
    } catch (Throwable t) {
      t.printStackTrace();
      if ( logger != null ) {
        logger.error(t);
      }
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
        csv.append(entry.getValue());
        if ( index < result.entrySet().size() ) csv.append(",");
      }
      csv.append("\n");
    }

    return csv.toString();
  }
}
