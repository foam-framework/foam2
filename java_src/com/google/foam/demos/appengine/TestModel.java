// DO NOT MODIFY BY HAND.
// GENERATED CODE (adamvy@google.com)
package com.google.foam.demos.appengine;


public class TestModel extends foam.core.AbstractFObject {
  private Object id_;
  private boolean idIsSet_ =     false;
;
  static foam.core.PropertyInfo ID = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "id";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public Object get_(Object o) {
        return ((TestModel)o).getId();
      }
      public void set(Object o, Object value) {
        ((TestModel)o).setId(cast(value));
      }
      public Object cast(Object o) {
        return (Object)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.parse.Fail();
      }
      public boolean getTransient() {
        return true;
      }
    };
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
        return ((TestModel)o).getName();
      }
      public void set(Object o, Object value) {
        ((TestModel)o).setName(cast(value));
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
  private int age_;
  private boolean ageIsSet_ =     false;
;
  static foam.core.PropertyInfo AGE = new foam.core.AbstractIntPropertyInfo() {
      public String getName() {
        return "age";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public int get_(Object o) {
        return ((TestModel)o).getAge();
      }
      public void set(Object o, Object value) {
        ((TestModel)o).setAge(cast(value));
      }
      public int cast(Object o) {
        return ( o instanceof Number ) ?((Number)o).intValue() :(int)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.IntParser();
      }
      public boolean getTransient() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("com.google.foam.demos.appengine.TestModel")
    .addProperty(TestModel.ID)
    .addProperty(TestModel.NAME)
    .addProperty(TestModel.AGE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public Object getId() {
    return getName();
  }
  public TestModel setId(Object val) {
    setName((String)val);
    return this;
  }
  public String getName() {
    if ( ! nameIsSet_ ) {
     return "";
    }
    return name_;
  }
  public TestModel setName(String val) {
    name_ = val;
    nameIsSet_ = true;
    return this;
  }
  public int getAge() {
    if ( ! ageIsSet_ ) {
     return 0;
    }
    return age_;
  }
  public TestModel setAge(int val) {
    age_ = val;
    ageIsSet_ = true;
    return this;
  }
  public void hello(String name) {
    
    System.out.println("Hello " + name);
                                 
  }
}