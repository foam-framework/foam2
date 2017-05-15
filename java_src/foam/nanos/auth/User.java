// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.nanos.auth;


public class User extends foam.core.AbstractFObject implements foam.nanos.auth.EnabledAware, foam.nanos.auth.LastModifiedAware, foam.nanos.auth.LastModifiedByAware {
  static foam.core.PropertyInfo EMAIL = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "email";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getEmail();
      }
      public void set(Object o, Object value) {
        ((User)o).setEmail(cast(value));
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
  static foam.core.PropertyInfo GROUPS = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "groups";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.dao.RelationshipPropertyValue get_(Object o) {
        return ((User)o).getGroups();
      }
      public void set(Object o, Object value) {
        ((User)o).setGroups(cast(value));
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
        return ((User)o).getId();
      }
      public void set(Object o, Object value) {
        ((User)o).setId(cast(value));
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
        return 100;
      }
    };
  private String spid_;
  private boolean spidIsSet_ =     false;
;
  static foam.core.PropertyInfo SPID = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "spid";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getSpid();
      }
      public void set(Object o, Object value) {
        ((User)o).setSpid(cast(value));
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
  private java.util.Date lastLogin_;
  private boolean lastLoginIsSet_ =     false;
;
  static foam.core.PropertyInfo LAST_LOGIN = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "lastLogin";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public java.util.Date get_(Object o) {
        return ((User)o).getLastLogin();
      }
      public void set(Object o, Object value) {
        ((User)o).setLastLogin(cast(value));
      }
      public java.util.Date cast(Object o) {
        return (java.util.Date)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.DateParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private String firstName_;
  private boolean firstNameIsSet_ =     false;
;
  static foam.core.PropertyInfo FIRST_NAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "firstName";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getFirstName();
      }
      public void set(Object o, Object value) {
        ((User)o).setFirstName(cast(value));
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
  private String middleName_;
  private boolean middleNameIsSet_ =     false;
;
  static foam.core.PropertyInfo MIDDLE_NAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "middleName";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getMiddleName();
      }
      public void set(Object o, Object value) {
        ((User)o).setMiddleName(cast(value));
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
  private String lastName_;
  private boolean lastNameIsSet_ =     false;
;
  static foam.core.PropertyInfo LAST_NAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "lastName";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getLastName();
      }
      public void set(Object o, Object value) {
        ((User)o).setLastName(cast(value));
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
  private String organization_;
  private boolean organizationIsSet_ =     false;
;
  static foam.core.PropertyInfo ORGANIZATION = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "organization";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getOrganization();
      }
      public void set(Object o, Object value) {
        ((User)o).setOrganization(cast(value));
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
  private String department_;
  private boolean departmentIsSet_ =     false;
;
  static foam.core.PropertyInfo DEPARTMENT = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "department";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getDepartment();
      }
      public void set(Object o, Object value) {
        ((User)o).setDepartment(cast(value));
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
  private String email_;
  private boolean emailIsSet_ =     false;
;
  private String id_;
  private String phone_;
  private boolean phoneIsSet_ =     false;
;
  static foam.core.PropertyInfo PHONE = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "phone";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getPhone();
      }
      public void set(Object o, Object value) {
        ((User)o).setPhone(cast(value));
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
  private String mobile_;
  private boolean mobileIsSet_ =     false;
;
  static foam.core.PropertyInfo MOBILE = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "mobile";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getMobile();
      }
      public void set(Object o, Object value) {
        ((User)o).setMobile(cast(value));
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
  private Object language_;
  private boolean languageIsSet_ =     false;
;
  static foam.core.PropertyInfo LANGUAGE = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "language";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public Object get_(Object o) {
        return ((User)o).getLanguage();
      }
      public void set(Object o, Object value) {
        ((User)o).setLanguage(cast(value));
      }
      public Object cast(Object o) {
        return (Object)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.AnyParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private String timeZone_;
  private boolean timeZoneIsSet_ =     false;
;
  static foam.core.PropertyInfo TIME_ZONE = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "timeZone";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getTimeZone();
      }
      public void set(Object o, Object value) {
        ((User)o).setTimeZone(cast(value));
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
  private String password_;
  private boolean passwordIsSet_ =     false;
;
  static foam.core.PropertyInfo PASSWORD = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "password";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getPassword();
      }
      public void set(Object o, Object value) {
        ((User)o).setPassword(cast(value));
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
        return 100;
      }
    };
  private String previousPassword_;
  private boolean previousPasswordIsSet_ =     false;
;
  static foam.core.PropertyInfo PREVIOUS_PASSWORD = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "previousPassword";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getPreviousPassword();
      }
      public void set(Object o, Object value) {
        ((User)o).setPreviousPassword(cast(value));
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
        return 100;
      }
    };
  private java.util.Date passwordLastModified_;
  private boolean passwordLastModifiedIsSet_ =     false;
;
  static foam.core.PropertyInfo PASSWORD_LAST_MODIFIED = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "passwordLastModified";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public java.util.Date get_(Object o) {
        return ((User)o).getPasswordLastModified();
      }
      public void set(Object o, Object value) {
        ((User)o).setPasswordLastModified(cast(value));
      }
      public java.util.Date cast(Object o) {
        return (java.util.Date)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.DateParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private String note_;
  private boolean noteIsSet_ =     false;
;
  static foam.core.PropertyInfo NOTE = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "note";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((User)o).getNote();
      }
      public void set(Object o, Object value) {
        ((User)o).setNote(cast(value));
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
  private foam.dao.RelationshipPropertyValue groups_;
  private boolean groupsIsSet_ =     false;
;
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.nanos.auth.User")
    .addProperty(User.ID)
    .addProperty(User.SPID)
    .addProperty(User.LAST_LOGIN)
    .addProperty(User.FIRST_NAME)
    .addProperty(User.MIDDLE_NAME)
    .addProperty(User.LAST_NAME)
    .addProperty(User.ORGANIZATION)
    .addProperty(User.DEPARTMENT)
    .addProperty(User.EMAIL)
    .addProperty(User.PHONE)
    .addProperty(User.MOBILE)
    .addProperty(User.LANGUAGE)
    .addProperty(User.TIME_ZONE)
    .addProperty(User.PASSWORD)
    .addProperty(User.PREVIOUS_PASSWORD)
    .addProperty(User.PASSWORD_LAST_MODIFIED)
    .addProperty(User.NOTE)
    .addProperty(User.GROUPS);
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
  public User setId(String val) {
    id_ = val;
    idIsSet_ = true;
    return this;
  }
  public String getSpid() {
    if ( ! spidIsSet_ ) {
     return "";
    }
    return spid_;
  }
  public User setSpid(String val) {
    spid_ = val;
    spidIsSet_ = true;
    return this;
  }
  public java.util.Date getLastLogin() {
    if ( ! lastLoginIsSet_ ) {
     return null;
    }
    return lastLogin_;
  }
  public User setLastLogin(java.util.Date val) {
    lastLogin_ = val;
    lastLoginIsSet_ = true;
    return this;
  }
  public String getFirstName() {
    if ( ! firstNameIsSet_ ) {
     return "";
    }
    return firstName_;
  }
  public User setFirstName(String val) {
    firstName_ = val;
    firstNameIsSet_ = true;
    return this;
  }
  public String getMiddleName() {
    if ( ! middleNameIsSet_ ) {
     return "";
    }
    return middleName_;
  }
  public User setMiddleName(String val) {
    middleName_ = val;
    middleNameIsSet_ = true;
    return this;
  }
  public String getLastName() {
    if ( ! lastNameIsSet_ ) {
     return "";
    }
    return lastName_;
  }
  public User setLastName(String val) {
    lastName_ = val;
    lastNameIsSet_ = true;
    return this;
  }
  public String getOrganization() {
    if ( ! organizationIsSet_ ) {
     return "";
    }
    return organization_;
  }
  public User setOrganization(String val) {
    organization_ = val;
    organizationIsSet_ = true;
    return this;
  }
  public String getDepartment() {
    if ( ! departmentIsSet_ ) {
     return "";
    }
    return department_;
  }
  public User setDepartment(String val) {
    department_ = val;
    departmentIsSet_ = true;
    return this;
  }
  public String getEmail() {
    if ( ! emailIsSet_ ) {
     return "";
    }
    return email_;
  }
  public User setEmail(String val) {
    email_ = val;
    emailIsSet_ = true;
    return this;
  }
  public String getPhone() {
    if ( ! phoneIsSet_ ) {
     return "";
    }
    return phone_;
  }
  public User setPhone(String val) {
    phone_ = val;
    phoneIsSet_ = true;
    return this;
  }
  public String getMobile() {
    if ( ! mobileIsSet_ ) {
     return "";
    }
    return mobile_;
  }
  public User setMobile(String val) {
    mobile_ = val;
    mobileIsSet_ = true;
    return this;
  }
  public Object getLanguage() {
    if ( ! languageIsSet_ ) {
     return "en";
    }
    return language_;
  }
  public User setLanguage(Object val) {
    language_ = val;
    languageIsSet_ = true;
    return this;
  }
  public String getTimeZone() {
    if ( ! timeZoneIsSet_ ) {
     return "";
    }
    return timeZone_;
  }
  public User setTimeZone(String val) {
    timeZone_ = val;
    timeZoneIsSet_ = true;
    return this;
  }
  public String getPassword() {
    if ( ! passwordIsSet_ ) {
     return "";
    }
    return password_;
  }
  public User setPassword(String val) {
    password_ = val;
    passwordIsSet_ = true;
    return this;
  }
  public String getPreviousPassword() {
    if ( ! previousPasswordIsSet_ ) {
     return "";
    }
    return previousPassword_;
  }
  public User setPreviousPassword(String val) {
    previousPassword_ = val;
    previousPasswordIsSet_ = true;
    return this;
  }
  public java.util.Date getPasswordLastModified() {
    if ( ! passwordLastModifiedIsSet_ ) {
     return null;
    }
    return passwordLastModified_;
  }
  public User setPasswordLastModified(java.util.Date val) {
    passwordLastModified_ = val;
    passwordLastModifiedIsSet_ = true;
    return this;
  }
  public String getNote() {
    if ( ! noteIsSet_ ) {
     return "";
    }
    return note_;
  }
  public User setNote(String val) {
    note_ = val;
    noteIsSet_ = true;
    return this;
  }
  public foam.dao.RelationshipPropertyValue getGroups() {
    if ( ! groupsIsSet_ ) {
     return null;
    }
    return groups_;
  }
  public User setGroups(foam.dao.RelationshipPropertyValue val) {
    groups_ = val;
    groupsIsSet_ = true;
    return this;
  }
}