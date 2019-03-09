package foam.nanos.ruler;

import foam.core.ContextAgent;
import foam.core.X;

import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public class RetryManager {
  protected final int      maxRetry_;
  protected final int      retryDelay_;
  protected CountDownLatch latch_;

  class Retry {
    final X            x_;
    final ContextAgent agent_;
    AtomicInteger      retryCount_ = new AtomicInteger(0);

    public Retry(X x, ContextAgent agent) {
      x_     = x;
      agent_ = agent;
    }

    public void start() {
      if ( retryCount_.getAndIncrement() < maxRetry_ ) {
        retry();
      }
    }

    private void retry() {
      new Timer().schedule(new TimerTask() {
        @Override
        public void run() {
          try {
            agent_.execute(x_);
            while ( latch_.getCount() > 0 ) {
              latch_.countDown();
            }
          } catch (Exception ex) {
            start();
            latch_.countDown();
          }
        }
      }, retryDelay_);
    }
  }

  public RetryManager() {
    this(5, 10000);
  }

  public RetryManager(int maxRetry, int retryDelay) {
    maxRetry_ = maxRetry;
    retryDelay_ = retryDelay;
    latch_ = new CountDownLatch(maxRetry);
  }

  public void submit(X x, ContextAgent agent) {
    new Retry(x, agent).start();
    try {
      latch_.await();
    } catch (InterruptedException e) { /*ignored*/ }
  }
}
