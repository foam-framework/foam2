// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package com.google.foam.demos.heroes;


public class Hero extends foam.core.AbstractFObject {
  private int id_;
  private boolean idIsSet_ =     false;
;
  static foam.core.PropertyInfo ID = new foam.core.AbstractIntPropertyInfo() {
      public String getName() {
        return "id";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public int get_(Object o) {
        return ((Hero)o).getId();
      }
      public void set(Object o, Object value) {
        ((Hero)o).setId(cast(value));
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
      public boolean getRequired() {
        return false;
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
        return ((Hero)o).getName();
      }
      public void set(Object o, Object value) {
        ((Hero)o).setName(cast(value));
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
  private boolean starred_;
  private boolean starredIsSet_ =     false;
;
  static foam.core.PropertyInfo STARRED = new foam.core.AbstractBooleanPropertyInfo() {
      public String getName() {
        return "starred";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public boolean get_(Object o) {
        return ((Hero)o).getStarred();
      }
      public void set(Object o, Object value) {
        ((Hero)o).setStarred(cast(value));
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
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("com.google.foam.demos.heroes.Hero")
    .addProperty(Hero.ID)
    .addProperty(Hero.NAME)
    .addProperty(Hero.STARRED);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public int getId() {
    if ( ! idIsSet_ ) {
     return 0;
    }
    return id_;
  }
  public Hero setId(int val) {
    id_ = val;
    idIsSet_ = true;
    return this;
  }
  public String getName() {
    if ( ! nameIsSet_ ) {
     return "";
    }
    return name_;
  }
  public Hero setName(String val) {
    name_ = val;
    nameIsSet_ = true;
    return this;
  }
  public boolean getStarred() {
    if ( ! starredIsSet_ ) {
     return false;
    }
    return starred_;
  }
  public Hero setStarred(boolean val) {
    starred_ = val;
    starredIsSet_ = true;
    return this;
  }
}