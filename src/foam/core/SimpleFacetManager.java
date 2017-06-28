/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class SimpleFacetManager
  implements FacetManager
{

  public Object getInstanceOf(Object value, Class type, X x) {
    return create(type, x);
  }

  public <T> T create(Class<T> type, X x) {
    try {
      // Automatically load FooImpl if Foo is abstract.
      // KGR: Why/where do we do this?
      if ( java.lang.reflect.Modifier.isAbstract(type.getModifiers()) ) {
        type = (Class<T>) Class.forName(type.getName() + "Impl");
      }

      T obj = type.newInstance();

      if ( obj instanceof ContextAware ) ((ContextAware)obj).setX(x);

      return obj;
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
