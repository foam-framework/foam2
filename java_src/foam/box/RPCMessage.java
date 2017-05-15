// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class RPCMessage extends foam.core.AbstractFObject {
  private String name_;
  private boolean nameIsSet_ =     false;
;
  static foam.core.PropertyInfo NAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "name";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((RPCMessage)o).getName();
      }
      public void set(Object o, Object value) {
        ((RPCMessage)o).setName(cast(value));
      }
      public String cast(Object o) {
        return (String)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.StringParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
      public int getWidth() {
        return 30;
      }
    };
  private Object[] args_;
  private boolean argsIsSet_ =     false;
;
  static foam.core.PropertyInfo ARGS = new foam.core.AbstractPropertyInfo() {
      public String getName() {
        return "args";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public Object[] get_(Object o) {
        return ((RPCMessage)o).getArgs();
      }
      public void set(Object o, Object value) {
        ((RPCMessage)o).setArgs(cast(value));
      }
      public Object[] cast(Object o) {
        return (Object[])o;
      }
      public int compare(Object o1, Object o2) {
        
          Object[] values1 = get_(o1);
          Object[] values2 = get_(o2);
                if ( values1.length > values2.length ) return 1;
                if ( values1.length < values2.length ) return -1;
        
                int result;
                for ( int i = 0 ; i < values1.length ; i++ ) {
                  result = ((Comparable)values1[i]).compareTo(values2[i]);
                  if ( result != 0 ) return result;
                }
                return 0;
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.ArrayParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.box.RPCMessage")
    .addProperty(RPCMessage.NAME)
    .addProperty(RPCMessage.ARGS);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public String getName() {
    if ( ! nameIsSet_ ) {
     return "";
    }
    return name_;
  }
  public RPCMessage setName(String val) {
    name_ = val;
    nameIsSet_ = true;
    return this;
  }
  public Object[] getArgs() {
    if ( ! argsIsSet_ ) {
     return null;
    }
    return args_;
  }
  public RPCMessage setArgs(Object[] val) {
    args_ = val;
    argsIsSet_ = true;
    return this;
  }
}