package foam.core;

/** Proxy for X interface. **/
public class ProxyX
  extends    ContextAwareSupport
  implements X
{

  public ProxyX() {
    this(EmptyX.instance());
  }

  public ProxyX(X x) {
    setX(x);
  }

  public Object get(String name) {
    return getX().get(this, name);
  }

  public Object get(X x, String name) {
    return getX().get(x, name);
  }

  public X put(String name, Object value) {
    setX(getX().put(name, value));

    return this;
  }

  public X putFactory(String name, XFactory factory) {
    setX(getX().putFactory(name, factory));

    return this;
  }

  public Object getInstanceOf(Object value, Class type) {
    return ((FacetManager) getX().get("facetManager")).getInstanceOf(value, type, this);
  }

  public <T> T create(Class<T> type) {
    return ((FacetManager) getX().get("facetManager")).create(type, this);
  }
}
