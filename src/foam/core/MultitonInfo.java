/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.Map;
import java.util.HashMap;

public class MultitonInfo<T>
  implements Axiom, XArgsFactory<T>
{
  Map<Object, T> instanceMap = new HashMap<Object, T>();

  String name;
  PropertyInfo p;

  public MultitonInfo(String name, PropertyInfo p) {
    this.name = name;
    this.p = p;
  }

  public String getName() {
    return name;
  }

  public synchronized T getInstance(Map<String, Object> args, X x) {
    Object key = args.get(p.getName());
    if ( ! instanceMap.containsKey(key) ) {
      try {
        Class<T> type = (Class<T>)p.getClassInfo().getObjClass();
        T obj = type.newInstance();
        ((ContextAware)obj).setX(x);
        for ( Map.Entry<String, Object> entry : args.entrySet() ) {
          ((FObject)obj).setProperty(entry.getKey(), entry.getValue());
        }
        if ( key == null ) return obj;
        instanceMap.put(key, obj);
      } catch (java.lang.Exception e) {
        e.printStackTrace();
        return null;
      }
    }
    return instanceMap.get(key);
  }
}
