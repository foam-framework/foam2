/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.Collections;
import java.util.Map;

public class SimpleFacetManager
  implements FacetManager
{

  public Object getInstanceOf(Object value, Class type, X x) {
    return create(type, x);
  }

  public <T> T create(Class<T> type, X x) {
    return create(type, Collections.<String, Object>emptyMap(), x);
  }

  public <T> T create(Class<T> type, Map<String, Object> args, X x) {
    try {
      // Automatically load FooImpl if Foo is abstract.
      // KGR: Why/where do we do this?
      if ( java.lang.reflect.Modifier.isAbstract(type.getModifiers()) ) {
        type = (Class<T>) Class.forName(type.getName() + "Impl");
      }

      try {
        java.lang.reflect.Method method = type.getMethod("getOwnClassInfo");
        ClassInfo classInfo = (ClassInfo)method.invoke(null);

        Object f = null;
        if ( x.get(classInfo.getId() + "_Factory") != null ) {
          f = x.get(classInfo.getId() + "_Factory");
        } else if ( classInfo.getAxiomsByClass(ContextFactory.class).size() == 1 ) {
          f = classInfo.getAxiomsByClass(ContextFactory.class).get(0);
        }

        if (f != null) {
          return ((ContextFactory<T>)f).getInstance(args, x);
        }

      } catch (NoSuchMethodException e) { }

      T obj = type.newInstance();

      if ( obj instanceof ContextAware ) ((ContextAware)obj).setX(x);

      if ( obj instanceof FObject ) {
        for (Map.Entry<String, Object> entry : args.entrySet()) {
          ((FObject)obj).setProperty(entry.getKey(), entry.getValue());
        }
      }

      return obj;
    } catch (java.lang.Exception e) {
      throw new RuntimeException(e);
    }
  }
}
