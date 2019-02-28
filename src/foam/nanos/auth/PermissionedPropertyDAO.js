foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionedPropertyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'java.util.Iterator',
    'java.util.HashMap',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Map'
  ],

  extends: 'foam.dao.ProxyDAO',

  documentation: `A DAO decorator that prevents users from updating / reading
      properties for which they do not have the update / read permission.

      To require update / read permission on a property, set the permissionRequired
      to be true, and add the corresponding permissions,
      i.e. model.ro.prop / model.rw.prop to  the groups who are granted permissions
      on the property.`,

  methods: [
    {
      name: 'put_',
      javaCode: `
  FObject oldObj = getDelegate().find(obj.getProperty("id"));
  return super.put_(x, maybeResetProperties(x, obj, oldObj));
      `,
    },

    {
      name: 'find_',
      javaCode: `
  FObject oldObj = getDelegate().find_(x, id);

  if ( oldObj != null ) {
    return maybeRemoveProperties(x, oldObj);
  }

  return null;
      `,
    },

    {
      name: 'select_',
      javaCode: `
      if ( x.get("auth") != null ) {
        foam.dao.Sink sink2 = ( sink != null ) ? new HidePropertiesSink(x, sink, this) : sink;
        super.select_(x, sink2, skip, limit, order, predicate);
        return sink;
      }
      return super.select_(x, sink, skip, limit, order, predicate);
      `,
    },

    {
      name: 'maybeResetProperties',
      type: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
  String of = obj.getClass().getSimpleName().toLowerCase();
  AuthService auth = (AuthService) x.get("auth");

  if ( propertyMap_.containsKey(of) ) {
    List properties = propertyMap_.get(of);
    Iterator e = properties.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
      maybeReset(axiom, of, auth, x, obj, oldObj);
    }
  } else {
    List<PropertyInfo> properties = new ArrayList<>();
    List list = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator e = list.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
      if ( axiom.getPermissionRequired() ) {
        properties.add(axiom);
        maybeReset(axiom, of, auth, x, obj, oldObj);
      }
    }
    propertyMap_.put(of, properties);
  }

  return obj;
      `,
    },

    {
      name: 'maybeRemoveProperties',
      type: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
  String of = oldObj.getClass().getSimpleName().toLowerCase();
  FObject obj = oldObj.fclone();
  AuthService auth = (AuthService) x.get("auth");

  if ( propertyMap_.containsKey(of) ) {
    List properties = propertyMap_.get(of);
    Iterator e = properties.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
      maybeRemove(axiom, of, auth, x, obj, oldObj);
    }
  } else {
    List<PropertyInfo> properties = new ArrayList<>();
    List list = oldObj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator e = list.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
      if ( axiom.getPermissionRequired() ) {
        properties.add(axiom);
        maybeRemove(axiom, of,auth, x, obj, oldObj);
      }
    }
    propertyMap_.put(of, properties);
  }

  return obj;
      `,
    },

    {
      name: 'maybeReset',
      args: [
        {
          name: 'axiom',
          javaType: 'PropertyInfo'
        },
        {
          name: 'of',
          type: 'String'
        },
        {
          name: 'auth',
          type: 'AuthService'
        },
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
  String axiomName =  axiom.toString();
  axiomName = axiomName.substring(axiomName.lastIndexOf(".") + 1);

  if ( ! auth.check(x, of + ".rw." + axiomName.toLowerCase()) ) {
    if ( oldObj != null ) {
      Object oldValue = oldObj.getProperty(axiomName);
      axiom.set(obj, oldValue);
    } else {
      axiom.clear(obj);
    }
  }
      `,
    },
    {
      name: 'maybeRemove',
      args: [
        {
          name: 'axiom',
          javaType: 'PropertyInfo'
        },
        {
          name: 'of',
          type: 'String'
        },
        {
          name: 'auth',
          type: 'AuthService'
        },
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
  String axiomName =  axiom.toString();
  axiomName = axiomName.substring(axiomName.lastIndexOf(".") + 1);

  if ( ! auth.check(x, of + ".rw." + axiomName.toLowerCase()) && ! auth.check(x, of + ".ro." + axiomName.toLowerCase()) ) axiom.clear(obj);
      `,
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  /** map of properties of a model that require model.permission.property for read / write operations **/
  protected Map<String, List<PropertyInfo>> propertyMap_ = new HashMap<>();

  public PermissionedPropertyDAO(foam.core.X x, foam.dao.DAO delegate) {
    super(x, delegate);
  }
        `);
      },
    },
  ],
});

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'HidePropertiesSink',

  javaImports: [
    'foam.core.FObject'
  ],

  extends: 'foam.dao.ProxySink',
  methods: [
    {
      name: 'put',
      javaCode: `
  FObject oldObj = this.dao.getDelegate().find(((FObject) obj).getProperty("id"));
  if (oldObj != null) {
    getDelegate().put(this.dao.maybeRemoveProperties(getX(), oldObj), sub);
  } else {
    getDelegate().put(obj, sub);
  }
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  private PermissionedPropertyDAO dao;
  public HidePropertiesSink(foam.core.X  x, foam.dao.Sink delegate, PermissionedPropertyDAO dao) {
    setX(x);
    setDelegate(delegate);
    this.dao = dao;
  }
        `);
      }
    }
  ]
});
