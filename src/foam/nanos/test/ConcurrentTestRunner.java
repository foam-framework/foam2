/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.test;

import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.X;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class ConcurrentTestRunner
  extends ContextAwareSupport
  implements ContextAgent
{
  protected int threadCount_;
  protected int invocationCount_;
  protected int timeout_;
  protected ConcurrentTest test_;

  // Builder pattern to avoid large constructor in the case
  // we want to add more variables to this test runner later
  public static class Builder<T extends Builder<T>> {

    private int threadCount_ = 0;
    private int invocationCount_ = 0;
    private int timeout_ = 0;
    private ConcurrentTest test_;

    public Builder() {}

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

    public T setTest(ConcurrentTest val) {
      test_ = val;
      return (T) this;
    }

    public ConcurrentTestRunner build() {
      return new ConcurrentTestRunner(this);
    }
  }

  protected ConcurrentTestRunner(Builder<?> builder) {
    threadCount_ = builder.threadCount_;
    invocationCount_ = builder.invocationCount_;
    timeout_ = builder.timeout_;
    test_ = builder.test_;
  }

  @Override
  public void execute(final X x) {
    // create countdownlatch and threads equal to the thread joint
    final CountDownLatch latch = new CountDownLatch(threadCount_);
    Thread[] threads = new Thread[threadCount_];

    // set up the test
    test_.setup(x);

    // get start time
    long startTime = System.currentTimeMillis();

    // execute all the threads
    for ( Thread thread : threads ) {
      thread = new Thread(new Runnable() {
        @Override
        public void run() {
          for ( int i = 0 ; i < invocationCount_ ; i ++ ) {
            test_.execute(x);
          }
          // count down the latch when finished
          latch.countDown();
        }
      });
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
    long duration = endTime - startTime
    System.out.println(threadCount_ +
        " thread(s) executing " + invocationCount_ +
        " times(s) took " + duration + " milliseconds");
  }
}