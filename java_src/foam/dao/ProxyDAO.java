// DO NOT MODIFY BY HAND.
// GENERATED CODE (adamvy@google.com)
package foam.dao;


public class ProxyDAO extends foam.dao.AbstractDAO {
  private foam.dao.DAO delegate_;
  private boolean delegateIsSet_ =     false;
;
  static foam.core.PropertyInfo DELEGATE = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "delegate";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.dao.DAO get_(Object o) {
        return ((ProxyDAO)o).getDelegate();
      }
      public void set(Object o, Object value) {
        ((ProxyDAO)o).setDelegate(cast(value));
      }
      public foam.dao.DAO cast(Object o) {
        return (foam.dao.DAO)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.FObjectParser();
      }
      public boolean getTransient() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.dao.ProxyDAO")
    .addProperty(ProxyDAO.DELEGATE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.dao.DAO getDelegate() {
    if ( ! delegateIsSet_ ) {
     return null;
    }
    return delegate_;
  }
  public ProxyDAO setDelegate(foam.dao.DAO val) {
    delegate_ = val;
    delegateIsSet_ = true;
    return this;
  }
  public void listen() {
    
  }
  public foam.core.FObject put(foam.core.FObject obj) {
    return getDelegate().put(obj);
  }
  public foam.core.FObject remove(foam.core.FObject obj) {
    return getDelegate().remove(obj);
  }
  public foam.core.FObject find(Object id) {
    return getDelegate().find(id);
  }
  public foam.dao.Sink select(foam.dao.Sink sink, Integer skip, Integer limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    return getDelegate().select(sink, skip, limit, order, predicate);
  }
  public void removeAll(Integer skip, Integer limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    getDelegate().removeAll(skip, limit, order, predicate);
  }
}