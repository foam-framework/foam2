package foam.nanos.auth;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by marcroopchand on 2017-05-24.
 */
public class LRULinkedHashMap<K, V> extends LinkedHashMap<K, V> {
  private final int MAX_SIZE;

  public LRULinkedHashMap(int maxSize) {
    this.MAX_SIZE = maxSize;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() >= MAX_SIZE;
  }
}