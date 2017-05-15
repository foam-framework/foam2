// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class BoxRegistry extends foam.core.AbstractFObject {
  private java.util.Map registry_;
  private boolean registryIsSet_ =     false;
;
  static foam.core.PropertyInfo REGISTRY = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "registry";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public java.util.Map get_(Object o) {
        return ((BoxRegistry)o).getRegistry();
      }
      public void set(Object o, Object value) {
        ((BoxRegistry)o).setRegistry(cast(value));
      }
      public java.util.Map cast(Object o) {
        return (java.util.Map)o;
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
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.box.BoxRegistry")
    .addProperty(BoxRegistry.REGISTRY);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  protected Object getMe() {
    return getX().get("me");
  }
  public java.util.Map getRegistry() {
    if ( ! registryIsSet_ ) {
      setRegistry(RegistryFactory_());
    }
    return registry_;
  }
  public BoxRegistry setRegistry(java.util.Map val) {
    registry_ = val;
    registryIsSet_ = true;
    return this;
  }
  protected java.util.Map RegistryFactory_() {
    return getX().create(java.util.HashMap.class);
  }
  public foam.box.Box doLookup(String name) {
    Registration r = (Registration)getRegistry().get(name);
    if ( r == null ) return null;
    return r.getExportBox();
  }
  public foam.box.Box register(String name, Object service, foam.box.Box box) {
    foam.box.Box exportBox = getX().create(foam.box.SubBox.class).setName(name).setDelegate((foam.box.Box)getMe());
    // TODO(adamvy): Apply service policy
    getRegistry().put(name, getX().create(Registration.class).setExportBox(exportBox).setLocalBox(box));
    return exportBox;
  }
  public void unregister(String name) {
    getRegistry().remove(name);
  }
  public static class Registration extends foam.core.AbstractFObject {
    private foam.box.Box exportBox_;
    private boolean exportBoxIsSet_ =       false;
;
    static foam.core.PropertyInfo EXPORT_BOX = new foam.core.AbstractFObjectPropertyInfo() {
        public String getName() {
          return "exportBox";
        }
        public Object get(Object o) {
          return get_(o);
        }
        public foam.box.Box get_(Object o) {
          return ((Registration)o).getExportBox();
        }
        public void set(Object o, Object value) {
          ((Registration)o).setExportBox(cast(value));
        }
        public foam.box.Box cast(Object o) {
          return (foam.box.Box)o;
        }
        public int compare(Object o1, Object o2) {
          return compareValues(get_(o1),get_(o2));
        }
        public foam.lib.parse.Parser jsonParser() {
          return new foam.lib.json.FObjectParser(foam.box.Box.class);
        }
        public boolean getTransient() {
          return false;
        }
        public boolean getRequired() {
          return false;
        }
      };
    private foam.box.Box localBox_;
    private boolean localBoxIsSet_ =       false;
;
    static foam.core.PropertyInfo LOCAL_BOX = new foam.core.AbstractFObjectPropertyInfo() {
        public String getName() {
          return "localBox";
        }
        public Object get(Object o) {
          return get_(o);
        }
        public foam.box.Box get_(Object o) {
          return ((Registration)o).getLocalBox();
        }
        public void set(Object o, Object value) {
          ((Registration)o).setLocalBox(cast(value));
        }
        public foam.box.Box cast(Object o) {
          return (foam.box.Box)o;
        }
        public int compare(Object o1, Object o2) {
          return compareValues(get_(o1),get_(o2));
        }
        public foam.lib.parse.Parser jsonParser() {
          return new foam.lib.json.FObjectParser(foam.box.Box.class);
        }
        public boolean getTransient() {
          return false;
        }
        public boolean getRequired() {
          return false;
        }
      };
    private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
      .setId("Registration")
      .addProperty(Registration.EXPORT_BOX)
      .addProperty(Registration.LOCAL_BOX);
    public foam.core.ClassInfo getClassInfo() {
      return classInfo_;
    }
    public static foam.core.ClassInfo getOwnClassInfo() {
      return classInfo_;
    }
    public foam.box.Box getExportBox() {
      if ( ! exportBoxIsSet_ ) {
       return null;
      }
      return exportBox_;
    }
    public Registration setExportBox(foam.box.Box val) {
      exportBox_ = val;
      exportBoxIsSet_ = true;
      return this;
    }
    public foam.box.Box getLocalBox() {
      if ( ! localBoxIsSet_ ) {
       return null;
      }
      return localBox_;
    }
    public Registration setLocalBox(foam.box.Box val) {
      localBox_ = val;
      localBoxIsSet_ = true;
      return this;
    }
  }
}