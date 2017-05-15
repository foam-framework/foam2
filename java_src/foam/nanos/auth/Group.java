// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.nanos.auth;


public class Group extends foam.core.AbstractFObject implements foam.nanos.auth.EnabledAware {
  private boolean parentIsSet_ =     false;
;
  static foam.core.PropertyInfo USERS = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "users";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.dao.RelationshipPropertyValue get_(Object o) {
        return ((Group)o).getUsers();
      }
      public void set(Object o, Object value) {
        ((Group)o).setUsers(cast(value));
      }
      public foam.dao.RelationshipPropertyValue cast(Object o) {
        return (foam.dao.RelationshipPropertyValue)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.FObjectParser(foam.dao.RelationshipPropertyValue.class);
      }
      public boolean getTransient() {
        return true;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private boolean idIsSet_ =     false;
;
  static foam.core.PropertyInfo ID = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "id";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Group)o).getId();
      }
      public void set(Object o, Object value) {
        ((Group)o).setId(cast(value));
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
  private String description_;
  private boolean descriptionIsSet_ =     false;
;
  static foam.core.PropertyInfo DESCRIPTION = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "description";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Group)o).getDescription();
      }
      public void set(Object o, Object value) {
        ((Group)o).setDescription(cast(value));
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
  private String parent_;
  private String id_;
  static foam.core.PropertyInfo PARENT = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "parent";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((Group)o).getParent();
      }
      public void set(Object o, Object value) {
        ((Group)o).setParent(cast(value));
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
  private foam.dao.RelationshipPropertyValue permissions_;
  private boolean permissionsIsSet_ =     false;
;
  static foam.core.PropertyInfo PERMISSIONS = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "permissions";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.dao.RelationshipPropertyValue get_(Object o) {
        return ((Group)o).getPermissions();
      }
      public void set(Object o, Object value) {
        ((Group)o).setPermissions(cast(value));
      }
      public foam.dao.RelationshipPropertyValue cast(Object o) {
        return (foam.dao.RelationshipPropertyValue)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.FObjectParser(foam.dao.RelationshipPropertyValue.class);
      }
      public boolean getTransient() {
        return true;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private foam.dao.RelationshipPropertyValue users_;
  private boolean usersIsSet_ =     false;
;
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.nanos.auth.Group")
    .addProperty(Group.ID)
    .addProperty(Group.DESCRIPTION)
    .addProperty(Group.PARENT)
    .addProperty(Group.PERMISSIONS)
    .addProperty(Group.USERS);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public String getId() {
    if ( ! idIsSet_ ) {
     return "";
    }
    return id_;
  }
  public Group setId(String val) {
    id_ = val;
    idIsSet_ = true;
    return this;
  }
  public String getDescription() {
    if ( ! descriptionIsSet_ ) {
     return "";
    }
    return description_;
  }
  public Group setDescription(String val) {
    description_ = val;
    descriptionIsSet_ = true;
    return this;
  }
  public String getParent() {
    if ( ! parentIsSet_ ) {
     return "";
    }
    return parent_;
  }
  public Group setParent(String val) {
    parent_ = val;
    parentIsSet_ = true;
    return this;
  }
  public foam.dao.RelationshipPropertyValue getPermissions() {
    if ( ! permissionsIsSet_ ) {
     return null;
    }
    return permissions_;
  }
  public Group setPermissions(foam.dao.RelationshipPropertyValue val) {
    permissions_ = val;
    permissionsIsSet_ = true;
    return this;
  }
  public foam.dao.RelationshipPropertyValue getUsers() {
    if ( ! usersIsSet_ ) {
     return null;
    }
    return users_;
  }
  public Group setUsers(foam.dao.RelationshipPropertyValue val) {
    users_ = val;
    usersIsSet_ = true;
    return this;
  }
}