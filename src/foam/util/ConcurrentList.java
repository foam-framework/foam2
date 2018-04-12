package foam.util;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.Iterator;

public class ConcurrentList<O> extends List<O> {
  private final ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
  private final Lock readLock = rwl.readLock();
  private final Lock writeLock = rwl.writeLock();

  public ConcurrentList(int maxSize, boolean isAutoDequeue) {
    super(maxSize, isAutoDequeue);
  }
  public ConcurrentList() {
    super();
  }
  public ConcurrentList(int maxSize) {
    super(maxSize);
  }
  @Override
  public void enQueue(O o) {
    writeLock.lock();
    try {
      super.enQueue(o);
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public O deQueue() {
    writeLock.lock();
    try {
      return super.deQueue();
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public void push(O o) {
    writeLock.lock();
    try {
      super.push(o);
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public O pop() {
    writeLock.lock();
    try {
      return super.pop();
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public int indexOf(O o) {
    readLock.lock();
    try {
      return super.indexOf(o);
    } finally {
      readLock.unlock();
    }
  }
  @Override
  public O valueAtIndex(int i) {
    readLock.lock();
    try {
      return super.valueAtIndex(i);
    } finally {
      readLock.unlock();
    }
  }
  @Override
  public O removeAtIndex(int i) {
    writeLock.lock();
    try {
      return super.removeAtIndex(i);
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public O remove(O o, int startIndex) {
    writeLock.lock();
    try {
      return super.remove(o, startIndex);
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public void addBefore(O o, int index) {
    writeLock.lock();
    try {
      super.addBefore(o, index);
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public void addAfter(O o, int index) {
    writeLock.lock();
    try {
      super.addAfter(o, index);
    } finally {
      writeLock.unlock();
    }
  }
  @Override
  public String toString() {
    readLock.lock();
    try {
      return super.toString();
    } finally {
      readLock.unlock();
    }
  }
  @Override
  public Object[] toArray() {
    readLock.lock();
    try {
      return super.toArray();
    } finally {
      readLock.unlock();
    }
  }
  @Override
  public <T> T[] toArray(T[] array) {
    readLock.lock();
    try {
      return super.toArray(array);
    } finally {
      readLock.unlock();
    }
  }
  @Override 
  public Iterator<O> iterator() {
    return new ListIter<O>(toArray(), 0);
  }
}