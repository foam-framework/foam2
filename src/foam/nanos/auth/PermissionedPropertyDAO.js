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
  return super.put_(x, resetProperties(x, obj, oldObj));
      `,
    },

    {
      name: 'find_',
      javaCode: `
  FObject oldObj = getDelegate().find_(x, id);

  if ( oldObj != null ) {
    return hideProperties(x, oldObj);
  }

  return null;
      `,
    },

    {
      name: 'select_',
      javaCode: `
  if ( sink != null ) {
    HidePropertiesSink hidePropertiesSink = new HidePropertiesSink(x, sink, this);
  }

  return super.select_(x, sink, skip, limit, order, predicate);
      `,
    },

    {
      name: 'resetProperties',
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

  if ( propertyMap_.containsKey(of) ) {
    List properties = propertyMap_.get(of);
    Iterator e = properties.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
      checkPermission(axiom, of, x, obj, oldObj, true);
    }
  } else {
    List<PropertyInfo> properties = new ArrayList<>();
    List list = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator e = list.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
      if ( axiom.getPermissionRequired() ) {
        properties.add(axiom);
        checkPermission(axiom, of, x, obj, oldObj, true);
      }
    }
    propertyMap_.put(of, properties);
  }

  return obj;
      `,
    },

    {
      name: 'hideProperties',
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

  if ( propertyMap_.containsKey(of) ) {
    List properties = propertyMap_.get(of);
    Iterator e = properties.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
        checkPermission(axiom, of, x, obj, oldObj, false);
    }
  } else {
    List<PropertyInfo> properties = new ArrayList<>();
    List list = oldObj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator e = list.iterator();
    while ( e.hasNext() ) {
      PropertyInfo axiom = (PropertyInfo) e.next();
      if ( axiom.getPermissionRequired() ) {
        properties.add(axiom);
        checkPermission(axiom, of, x, obj, oldObj, false);
      }
    }
    propertyMap_.put(of, properties);
  }

  return obj;
      `,
    },

    {
      name: 'checkPermission',
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
        },
        {
          name: 'write',
          type: 'Boolean'
        }
      ],
      javaCode: `
  AuthService auth = (AuthService) x.get("auth");
  String axiomName =  axiom.toString();
  axiomName = axiomName.substring(axiomName.lastIndexOf(".") + 1);
  boolean hasPermission = auth.check(x, of + ".rw." + axiomName.toLowerCase());
  if ( ! write ) {
    hasPermission = hasPermission || auth.check(x, of + ".ro." + axiomName.toLowerCase());
  }

  if ( ! hasPermission ) {
    if ( write && oldObj != null ) {
      Object oldValue = oldObj.getProperty(axiomName);
      axiom.set(obj, oldValue);
    } else {
      axiom.clear(obj);
    }
  }
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
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
      javaCode: `
  FObject oldObj = this.dao.getDelegate().find(((FObject) obj).getProperty("id"));
  if (oldObj != null) {
    super.put(this.dao.hideProperties(getX(), oldObj), sub);
  } else {
    super.put(obj, sub);
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
