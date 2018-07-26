/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.X;
import java.io.PrintWriter;
import java.util.concurrent.CountDownLatch;

public class BenchmarkRunner
  extends ContextAwareSupport
  implements ContextAgent
{
  protected String    name_;
  protected int       threadCount_;
  protected int       invocationCount_;
  protected Benchmark test_;
  protected String    result_ = "";

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
    name_            = builder.name_;
    threadCount_     = builder.threadCount_;
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
   * GetInvocationCount
   * @return the invocation count
   */
  public int getInvocationCount() {
    return invocationCount_;
  }

  public String getResult() {
    return result_;
  }

  @Override
  public void execute(final X x) {
    try {
      // create CountDownLatch and thread group equal
      final CountDownLatch latch = new CountDownLatch(threadCount_);
      ThreadGroup group = new ThreadGroup(name_);

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

      result_ =
        "Threads: " + threadCount_ + "\n" +
        "Operations per second: " + (complete / duration) + "\n" +
        "Operations per second per thread: " + (complete / duration / (float) threadCount_) + "\n";

      System.out.print(result_);
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}
