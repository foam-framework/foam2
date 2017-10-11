package foam.core;

public abstract class MergedListener {
  protected Thread thread_ = null;

  protected volatile Object lastEvent_ = null;

  protected synchronized void clear() {
    thread_ = null;
  }

  protected class ListenerThread implements Runnable {
    public void run() {
      try {
        Thread.sleep(getDelay());
      } catch (InterruptedException e) {}

      clear();
      go(lastEvent_);
    }
  }

  // Public Interface
  public synchronized void fire(Object event) {
    lastEvent_ = event;

    if ( thread_ == null ) {
      thread_ = new Thread(new ListenerThread());
      thread_.start();
    }
  }

  public abstract int getDelay();
  public abstract void go(Object event);
}
