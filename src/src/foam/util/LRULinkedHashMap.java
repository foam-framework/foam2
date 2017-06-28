package foam.nanos.util;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.HashMap;

/**
 * Created by marcroopchand on 2017-05-24.
 */
public class LRULinkedHashMap<K, V> extends LinkedHashMap<K, V> {
  private final int maxSize_;

  public LRULinkedHashMap(int maxSize) {
    this.maxSize_ = maxSize;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() >= maxSize_;
  }
}
