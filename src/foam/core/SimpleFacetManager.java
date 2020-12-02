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
    if ( type == foam.core.FObject.class ) {
      Thread.dumpStack();
      System.err.println("Unable to create FObject.");
      return null;
    }
    try {
      // Automatically load FooImpl if Foo is abstract.
      // KGR: Why/where do we do this?
      // KGR: I Think this is wrong. If Foo is Abstract it should be called AbstractFoos
      if ( java.lang.reflect.Modifier.isAbstract(type.getModifiers()) ) {
        try {
          type = (Class<T>) Class.forName(type.getName() + "Impl");
        } catch (ClassNotFoundException e) {
          // NOP
        }
      }

      try {
        java.lang.reflect.Method method = type.getMethod("getOwnClassInfo");
        ClassInfo classInfo = (ClassInfo) method.invoke(null);

        // First check the context for a custom factory for this type of object.
        // If there's nothing in the context, check the ClassInfo for an axiom
        // that creates instances of this type of object. Singletons and
        // multitons are common examples of this type of axiom.
        Object f = null;
        if ( x.get(classInfo.getId() + "_Factory") != null ) {
          f = x.get(classInfo.getId() + "_Factory");
        } else if ( classInfo.getAxiomsByClass(XArgsFactory.class).size() == 1 ) {
          f = classInfo.getAxiomsByClass(XArgsFactory.class).get(0);
        }

        if ( f != null ) {
          return ((XArgsFactory<T>) f).getInstance(args, x);
        }

      } catch (NoSuchMethodException e) {
      }

      T obj = type.newInstance();

      if ( obj instanceof ContextAware ) ((ContextAware) obj).setX(x);

      if ( obj instanceof FObject ) {
        for ( Map.Entry<String, Object> entry : args.entrySet() )
          ((FObject) obj).setProperty(entry.getKey(), entry.getValue());
      }

      return obj;
    } catch (Throwable e) {
      e.printStackTrace();
      throw new RuntimeException(e);
    }
  }
}
