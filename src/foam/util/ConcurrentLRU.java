package foam.util;

import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ConcurrentLRU<K, V>
  extends LRU<K, V>
{
  private final ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
  private final Lock readLock = rwl.readLock();
  private final Lock writeLock = rwl.writeLock();
  public ConcurrentLRU( int maxSize ) {
    super(maxSize);
  }


  @Override
  public void cache(K key, V value) {
    writeLock.lock();
    try {
      super.cache(key, value);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public V get (K key) {
    writeLock.lock();
    try {
      return super.get(key);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public V remove(K key) {
    writeLock.lock(); 
    try {
      return super.remove(key);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public Set<Map.Entry<K,V>> entrySet() {
    //TODO: can not prevent value change
    readLock.lock();
    try {
      return super.entrySet();
    } finally {
      readLock.unlock();
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
  public String toReverseString() {
    readLock.lock();
    try {
      return super.toReverseString();
    } finally {
      readLock.unlock();
    }
  }
}