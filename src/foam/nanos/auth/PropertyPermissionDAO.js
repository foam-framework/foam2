foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'PropertyPermissionDAO',
  
    javaImports: [
      'foam.nanos.auth.AuthService',
      'foam.core.FObject',
      'foam.core.PropertyInfo',
      'foam.core.X',
      'foam.dao.ProxySink',
      'java.util.Iterator',
      'java.util.List'
    ],
  
    extends: 'foam.dao.ProxyDAO',
    documentation: `A DAO decorator that prevents user from updating / reading
        properties for which the user does not have the update / read permission`,

    methods: [
      {
        name: 'put_',
        javaCode: `
    FObject oldObj = getDelegate().find(obj.getProperty("id"));
    return super.put_(x, hideProperties(x, obj, oldObj, true));
        `,
      },
  
      {
        name: 'find_',
        javaCode: `
    FObject oldObj = getDelegate().find(id);
    
    if ( oldObj != null ) {
      FObject copiedObj = oldObj.fclone();
      return hideProperties(x, copiedObj, oldObj, false);
    }

    return super.find_(x, id);
        `,
      },

      {
        name: 'select_',
        javaCode: `
    if ( sink != null ) {
      ProxySink proxySink = new ProxySink(x, sink) {
        @Override
        public void put(Object obj, foam.core.Detachable sub) {
          FObject copiedObj = ((FObject) obj).fclone();
          FObject oldObj = PropertyPermissionDAO.this.getDelegate().find(copiedObj.getProperty("id"));
          if ( oldObj != null ) {
            super.put(hideProperties(x, copiedObj, oldObj, false), sub);
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
        name: 'hideProperties',
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
          },
          {
            name: 'write',
            javaType: 'Boolean'
          }
        ],
        javaCode: `
    if ( oldObj != null ) {
      AuthService auth = (AuthService) x.get("auth");
      String of = obj.getClass().getSimpleName().toLowerCase();
      List list = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator e = list.iterator();
  
      while( e.hasNext() ) {
        PropertyInfo axiom = (PropertyInfo) e.next();
        if ( axiom.getPermissionRequired() ) {
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
        }
      }
    }
  
    return obj;
        `,
      },
    ],
  
    axioms: [
      {
        buildJavaClass: function(cls) {
          cls.extras.push(`
  public PropertyPermissionDAO(foam.core.X x, foam.dao.DAO delegate) {
    super(x, delegate);
  }
          `);
        },
      },
    ],
  });
  