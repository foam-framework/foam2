/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.Map;
import java.util.HashMap;

public class MultitonInfo<T>
  implements Axiom, Factory<T>
{
  Map<Object, T> instanceMap = new HashMap<Object, T>();

  String name;
  PropertyInfo p;
  Class<T> type;

  MultitonInfo(String name, PropertyInfo p, Class<T> type) {
    this.name = name;
    this.p = p;
    this.type = type;
  }

  public String getName() {
    return name;
  }

  public T getInstance(Map<String, Object> args, X x) {
    Object key = args.get(p.getName());
    if ( ! instanceMap.containsKey(key) ) {
      try {
        T obj = type.newInstance();
        ((ContextAware)obj).setX(x);
        for (Map.Entry<String, Object> entry : args.entrySet()) {
          ((FObject)obj).setProperty(entry.getKey(), entry.getValue());
        }
        instanceMap.put(key, obj);
      } catch (java.lang.Exception e) {
        e.printStackTrace();
        return null;
      }
    }
    return instanceMap.get(key);
  }
}
