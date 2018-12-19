foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'PropertyUserPermissionDAO',
  
    javaImports: [
      'foam.core.FObject',
      'foam.core.PropertyInfo',
      'foam.core.X',
      'foam.dao.ProxySink',
      'foam.nanos.auth.AuthService',
      'java.util.Iterator',
      'java.util.LinkedHashMap',
      'java.util.LinkedList',
      'java.util.List',
      'java.util.Map'
    ],
  
    extends: 'foam.dao.ProxyDAO',

    documentation: `A DAO decorator that prevents users from updating / reading
        properties for which they do not have the update / read permission`,

    methods: [
      {
        name: 'put_',
        javaCode: `
    FObject oldObj = getDelegate().find(obj.getProperty("id"));
    return super.put_(x, clearProperties(x, obj, oldObj));
        `,
      },
  
      {
        name: 'find_',
        javaCode: `
    FObject oldObj = getDelegate().find(id);
    
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
      ProxySink proxySink = new ProxySink(x, sink) {
        @Override
        public void put(Object obj, foam.core.Detachable sub) {
          FObject oldObj = PropertyUserPermissionDAO.this.getDelegate().find(((FObject) obj).getProperty("id"));
          if ( oldObj != null ) {
            super.put(hideProperties(x, oldObj), sub);
          } else {
            super.put(obj, sub);
          }
        }
      };

      return ((ProxySink) super.select_(x, proxySink, skip, limit, order, predicate)).getDelegate();
    }

    return super.select_(x, sink, skip, limit, order, predicate);
        `,
      },

      {
        name: 'clearProperties',
        javaReturns: 'foam.core.FObject',
        args: [
          {
            name: 'x',
            javaType: 'foam.core.X'
          },
          {
            name: 'obj',
            javaType: 'foam.core.FObject'
          },
          {
            name: 'oldObj',
            javaType: 'foam.core.FObject'
          }
        ],
        javaCode: `
    if ( oldObj != null ) {
      String of = obj.getClass().getSimpleName().toLowerCase();

      if ( propertyMap.containsKey(of) ) {
        List properties = propertyMap.get(of);
        Iterator e = properties.iterator();
        while ( e.hasNext() ) {
          PropertyInfo axiom = (PropertyInfo) e.next();
          checkPermission(axiom, of, x, obj, oldObj, true);
        }
      } else {
        List<PropertyInfo> properties = new LinkedList<>();
        List list = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator e = list.iterator();
        while ( e.hasNext() ) {
          PropertyInfo axiom = (PropertyInfo) e.next();
          if ( axiom.getPermissionRequired() ) {
            properties.add(axiom);
            checkPermission(axiom, of, x, obj, oldObj, true);
          }
        }
        propertyMap.put(of, properties);
      }
    }
      
    return obj;
        `,
      },

      {
        name: 'hideProperties',
        javaReturns: 'foam.core.FObject',
        args: [
          {
            name: 'x',
            javaType: 'foam.core.X'
          },
          {
            name: 'oldObj',
            javaType: 'foam.core.FObject'
          }
        ],
        javaCode: `
    String of = oldObj.getClass().getSimpleName().toLowerCase();
    FObject obj = oldObj.fclone();

    if ( propertyMap.containsKey(of) ) {
      List properties = propertyMap.get(of);
      Iterator e = properties.iterator();
      while ( e.hasNext() ) {
        PropertyInfo axiom = (PropertyInfo) e.next();
         checkPermission(axiom, of, x, obj, oldObj, false);
      }
    } else {
      List<PropertyInfo> properties = new LinkedList<>();
      List list = oldObj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator e = list.iterator();
      while ( e.hasNext() ) {
        PropertyInfo axiom = (PropertyInfo) e.next();
        if ( axiom.getPermissionRequired() ) {
          properties.add(axiom);
          checkPermission(axiom, of, x, obj, oldObj, false);
        }
      }
      propertyMap.put(of, properties);
    }
      
    return obj;
        `,
      },

      {
        name: 'checkPermission',
        javaReturns: 'void',
        args: [
          {
            name: 'axiom',
            javaType: 'PropertyInfo'
          },
          {
            name: 'of',
            javaType: 'String'
          },
          {
            name: 'x',
            javaType: 'foam.core.X'
          },
          {
            name: 'obj',
            javaType: 'foam.core.FObject'
          },
          {
            name: 'oldObj',
            javaType: 'foam.core.FObject'
          },
          {
            name: 'write',
            javaType: 'Boolean'
          }
        ],
        javaCode: `
    AuthService auth = (AuthService) x.get("auth");
    String axiomName =  axiom.toString();
    axiomName = axiomName.substring(axiomName.lastIndexOf(".") + 1);
    boolean hasPermission = auth.check(x, of + ".rw." + axiomName);
    if ( ! write ) {
      hasPermission = hasPermission || auth.check(x, of + ".ro." + axiomName);
    }

    if ( ! hasPermission ) {
      if ( write ) {
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
  protected Map<String, List<PropertyInfo>> propertyMap = new LinkedHashMap<>();

  public PropertyUserPermissionDAO(foam.core.X x, foam.dao.DAO delegate) {
    super(x, delegate);
  }
          `);
        },
      },
    ],
  });
  