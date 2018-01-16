/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.X;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class BenchmarkRunner
  extends ContextAwareSupport
  implements ContextAgent
{
  protected String name_;
  protected int threadCount_;
  protected int invocationCount_;
  protected int timeout_;
  protected Benchmark test_;

  // Builder pattern to avoid large constructor in the case
  // we want to add more variables to this test runner later.
  //
  // Generics were added to support inheritance if more
  // properties needed to be added to the builder class by
  // an inherited class
  public static class Builder<T extends Builder<T>>
    extends ContextAwareSupport
  {
    private String name_ = "foam.nanos.bench.BenchmarkRunner";
    private int threadCount_ = 0;
    private int invocationCount_ = 0;
    private int timeout_ = 0;
    private Benchmark test_;

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

    public T setTimeout(int val) {
      timeout_ = val;
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
    setX(x);
    name_ = builder.name_;
    threadCount_ = builder.threadCount_;
    invocationCount_ = builder.invocationCount_;
    timeout_ = builder.timeout_;
    test_ = builder.test_;
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
   * GetInvocationCount
   * @return the invocation count
   */
  public int getInvocationCount() {
    return invocationCount_;
  }

  /**
   * GetTimeout
   * @return the timeout in milliseconds
   */
  public int getTimeout() {
    return timeout_;
  }

  @Override
  public void execute(final X x) {
    // create CountDownLatch and thread group equal
    final CountDownLatch latch = new CountDownLatch(threadCount_);
    ThreadGroup group = new ThreadGroup(name_);

    // set up the test
    test_.setup(x);

    // get start time
    long startTime = System.currentTimeMillis();

    // execute all the threads
    for ( int i = 0 ; i < threadCount_ ; i++ ) {
      final int tno = i;
      Thread thread = new Thread(group, new Runnable() {
        @Override
        public void run() {
          for ( int j = 0 ; j < invocationCount_ ; j++ ) {
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

    try {
      // wait until latch reaches 0, or until timeout is reached
      if (timeout_ != 0) {
        latch.await(timeout_, TimeUnit.MILLISECONDS);
      } else {
        latch.await();
      }
    } catch (Throwable ignored) {}

    // calculate length taken
    long endTime = System.currentTimeMillis();
    long duration = endTime - startTime;
    System.out.println(threadCount_ +
        " thread(s) executing " + invocationCount_ +
        " times(s) took " + duration + " milliseconds");
  }
}