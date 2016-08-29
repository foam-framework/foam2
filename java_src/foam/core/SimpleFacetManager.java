package foam.core;

import java.lang.reflect.Constructor;

public class SimpleFacetManager implements FacetManager {
  public Object getInstanceOf(Object value, Class type, X x) {
    return create(type, x);
  }

  public Object create(Class type, X x) {
    try {
      Constructor[] ctors = type.getConstructors();
      if ( ctors[0].getParameterTypes()[0] == X.class ) {
        return ctors[0].newInstance(x);
      }

      return type.newInstance();
    } catch(Exception e) {
      throw new RuntimeException(e);
    }
  }
}
