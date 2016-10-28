package foam.core;

public interface FacetManager {
  public Object getInstanceOf(Object value, Class type, X x);
  public <T> T create(Class<T> type, X x);
}
