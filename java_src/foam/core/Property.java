// DO NOT MODIFY BY HAND.
// GENERATED CODE (adamvy@google.com)
package foam.core;


public class Property extends foam.core.AbstractFObject implements foam.mlang.order.Comparator {
  static foam.core.PropertyInfo JAVA_TYPE = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "javaType";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Property)o).getJavaType();
      }
      public void set(Object o, Object value) {
        ((Property)o).setJavaType(cast(value));
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
    };
  static foam.core.PropertyInfo JAVA_VALUE = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "javaValue";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Property)o).getJavaValue();
      }
      public void set(Object o, Object value) {
        ((Property)o).setJavaValue(cast(value));
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
    };
  private boolean transientIsSet_ =     false;
;
  static foam.core.PropertyInfo TRANSIENT = new foam.core.AbstractBooleanPropertyInfo() {
      public String getName() {
        return "transient";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public boolean get_(Object o) {
        return ((Property)o).getTransient();
      }
      public void set(Object o, Object value) {
        ((Property)o).setTransient(cast(value));
      }
      public boolean cast(Object o) {
        return (boolean)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.BooleanParser();
      }
      public boolean getTransient() {
        return false;
      }
    };
  private boolean networkTransient_;
  private boolean networkTransientIsSet_ =     false;
;
  static foam.core.PropertyInfo NETWORK_TRANSIENT = new foam.core.AbstractBooleanPropertyInfo() {
      public String getName() {
        return "networkTransient";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public boolean get_(Object o) {
        return ((Property)o).getNetworkTransient();
      }
      public void set(Object o, Object value) {
        ((Property)o).setNetworkTransient(cast(value));
      }
      public boolean cast(Object o) {
        return (boolean)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.BooleanParser();
      }
      public boolean getTransient() {
        return false;
      }
    };
  private boolean storageTransient_;
  private boolean storageTransientIsSet_ =     false;
;
  static foam.core.PropertyInfo STORAGE_TRANSIENT = new foam.core.AbstractBooleanPropertyInfo() {
      public String getName() {
        return "storageTransient";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public boolean get_(Object o) {
        return ((Property)o).getStorageTransient();
      }
      public void set(Object o, Object value) {
        ((Property)o).setStorageTransient(cast(value));
      }
      public boolean cast(Object o) {
        return (boolean)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.BooleanParser();
      }
      public boolean getTransient() {
        return false;
      }
    };
  private String shortName_;
  private boolean shortNameIsSet_ =     false;
;
  static foam.core.PropertyInfo SHORT_NAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "shortName";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Property)o).getShortName();
      }
      public void set(Object o, Object value) {
        ((Property)o).setShortName(cast(value));
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
    };
  private String javaType_;
  private boolean javaTypeIsSet_ =     false;
;
  private boolean transient_;
  private String javaJSONParser_;
  private boolean javaJSONParserIsSet_ =     false;
;
  static foam.core.PropertyInfo JAVA_JSONPARSER = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "javaJSONParser";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Property)o).getJavaJSONParser();
      }
      public void set(Object o, Object value) {
        ((Property)o).setJavaJSONParser(cast(value));
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
    };
  private String javaInfoType_;
  private boolean javaInfoTypeIsSet_ =     false;
;
  static foam.core.PropertyInfo JAVA_INFO_TYPE = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "javaInfoType";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Property)o).getJavaInfoType();
      }
      public void set(Object o, Object value) {
        ((Property)o).setJavaInfoType(cast(value));
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
    };
  private String javaToJSON_;
  private boolean javaToJSONIsSet_ =     false;
;
  static foam.core.PropertyInfo JAVA_TO_JSON = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "javaToJSON";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Property)o).getJavaToJSON();
      }
      public void set(Object o, Object value) {
        ((Property)o).setJavaToJSON(cast(value));
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
    };
  private String javaFactory_;
  private boolean javaFactoryIsSet_ =     false;
;
  static foam.core.PropertyInfo JAVA_FACTORY = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "javaFactory";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Property)o).getJavaFactory();
      }
      public void set(Object o, Object value) {
        ((Property)o).setJavaFactory(cast(value));
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
    };
  private String javaValue_;
  private boolean javaValueIsSet_ =     false;
;
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.core.Property")
    .addProperty(Property.TRANSIENT)
    .addProperty(Property.NETWORK_TRANSIENT)
    .addProperty(Property.STORAGE_TRANSIENT)
    .addProperty(Property.SHORT_NAME)
    .addProperty(Property.JAVA_TYPE)
    .addProperty(Property.JAVA_JSONPARSER)
    .addProperty(Property.JAVA_INFO_TYPE)
    .addProperty(Property.JAVA_TO_JSON)
    .addProperty(Property.JAVA_FACTORY)
    .addProperty(Property.JAVA_VALUE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public boolean getTransient() {
    if ( ! transientIsSet_ ) {
     return false;
    }
    return transient_;
  }
  public Property setTransient(boolean val) {
    transient_ = val;
    transientIsSet_ = true;
    return this;
  }
  public boolean getNetworkTransient() {
    if ( ! networkTransientIsSet_ ) {
     return false;
    }
    return networkTransient_;
  }
  public Property setNetworkTransient(boolean val) {
    networkTransient_ = val;
    networkTransientIsSet_ = true;
    return this;
  }
  public boolean getStorageTransient() {
    if ( ! storageTransientIsSet_ ) {
     return false;
    }
    return storageTransient_;
  }
  public Property setStorageTransient(boolean val) {
    storageTransient_ = val;
    storageTransientIsSet_ = true;
    return this;
  }
  public String getShortName() {
    if ( ! shortNameIsSet_ ) {
     return "";
    }
    return shortName_;
  }
  public Property setShortName(String val) {
    shortName_ = val;
    shortNameIsSet_ = true;
    return this;
  }
  public String getJavaType() {
    if ( ! javaTypeIsSet_ ) {
     return "Object";
    }
    return javaType_;
  }
  public Property setJavaType(String val) {
    javaType_ = val;
    javaTypeIsSet_ = true;
    return this;
  }
  public String getJavaJSONParser() {
    if ( ! javaJSONParserIsSet_ ) {
     return "foam.lib.json.AnyParser";
    }
    return javaJSONParser_;
  }
  public Property setJavaJSONParser(String val) {
    javaJSONParser_ = val;
    javaJSONParserIsSet_ = true;
    return this;
  }
  public String getJavaInfoType() {
    if ( ! javaInfoTypeIsSet_ ) {
     return "";
    }
    return javaInfoType_;
  }
  public Property setJavaInfoType(String val) {
    javaInfoType_ = val;
    javaInfoTypeIsSet_ = true;
    return this;
  }
  public String getJavaToJSON() {
    if ( ! javaToJSONIsSet_ ) {
     return "";
    }
    return javaToJSON_;
  }
  public Property setJavaToJSON(String val) {
    javaToJSON_ = val;
    javaToJSONIsSet_ = true;
    return this;
  }
  public String getJavaFactory() {
    if ( ! javaFactoryIsSet_ ) {
     return "";
    }
    return javaFactory_;
  }
  public Property setJavaFactory(String val) {
    javaFactory_ = val;
    javaFactoryIsSet_ = true;
    return this;
  }
  public String getJavaValue() {
    if ( ! javaValueIsSet_ ) {
     return "";
    }
    return javaValue_;
  }
  public Property setJavaValue(String val) {
    javaValue_ = val;
    javaValueIsSet_ = true;
    return this;
  }
    public void compare(Object o1, Object o2) {
    }
    public void orderDirection() {
    }
    public void orderPrimaryProperty() {
    }
    public void orderTail() {
    }
}
