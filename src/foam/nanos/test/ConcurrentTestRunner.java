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
  private int threadCount_;
  private int invocationCount_;
  private int timeout_;
  private ConcurrentTest test_;

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
    final CountDownLatch latch = new CountDownLatch(threadCount_);
    Thread[] threads = new Thread[threadCount_];

    test_.setup(x);

    long startTime = System.currentTimeMillis();

    for ( Thread thread : threads ) {
      thread = new Thread(new Runnable() {
        @Override
        public void run() {
          for ( int i = 0 ; i < invocationCount_ ; i ++ ) {
            test_.execute(x);
          }
          latch.countDown();
        }
      });
      thread.start();
    }

    try {
      if (timeout_ != 0) {
        latch.await(timeout_, TimeUnit.MILLISECONDS);
      } else {
        latch.await();
      }
    } catch (Throwable ignored) {}

    long endTime = System.currentTimeMillis();
    System.out.println(threadCount_ +
        " thread(s) executing " + invocationCount_ +
        " times(s) took " + (endTime - startTime) + " milliseconds");
  }
}