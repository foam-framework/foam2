package foam.core;

import java.lang.reflect.Constructor;

public class SimpleFacetManager implements FacetManager {
  public Object getInstanceOf(Object value, Class type, X x) {
    return create(type, x);
  }

  public Object create(Class type, X x) {
    try {
      Object obj = type.newInstance();

      if ( obj instanceof ContextAware ) {
        ((ContextAware)obj).setX(x);
      }

      return obj;
    } catch(Exception e) {
      throw new RuntimeException(e);
    }
  }
}
