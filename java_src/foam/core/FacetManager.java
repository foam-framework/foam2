package foam.core;

public interface FacetManager {
  public Object getInstanceOf(Object value, Class type, X x);
  public Object create(Class type, X x);
}
