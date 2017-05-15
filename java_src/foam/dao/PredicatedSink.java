// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.dao;


public class PredicatedSink extends foam.dao.ProxySink {
  private foam.mlang.predicate.Predicate predicate_;
  private boolean predicateIsSet_ =     false;
;
  static foam.core.PropertyInfo PREDICATE = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "predicate";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.mlang.predicate.Predicate get_(Object o) {
        return ((PredicatedSink)o).getPredicate();
      }
      public void set(Object o, Object value) {
        ((PredicatedSink)o).setPredicate(cast(value));
      }
      public foam.mlang.predicate.Predicate cast(Object o) {
        return (foam.mlang.predicate.Predicate)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.FObjectParser(foam.mlang.predicate.Predicate.class);
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.dao.PredicatedSink")
    .addProperty(PredicatedSink.PREDICATE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.mlang.predicate.Predicate getPredicate() {
    if ( ! predicateIsSet_ ) {
     return null;
    }
    return predicate_;
  }
  public PredicatedSink setPredicate(foam.mlang.predicate.Predicate val) {
    predicate_ = val;
    predicateIsSet_ = true;
    return this;
  }
  public void put(foam.core.FObject obj, foam.core.Detachable sub) {
    if ( getPredicate().f(obj) ) getDelegate().put(obj, sub);
  }
  public void remove(foam.core.FObject obj, foam.core.Detachable sub) {
    if ( getPredicate().f(obj) ) getDelegate().remove(obj, sub);
  }
}