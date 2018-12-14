foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'PropertyPermissionDAO',
  
    javaImports: [
      'foam.nanos.auth.AuthService',
      'foam.core.FObject',
      'foam.core.PropertyInfo',
      'foam.core.X',
      'java.util.Iterator',
      'java.util.List'
    ],
  
    extends: 'foam.dao.ProxyDAO',
    documentation: `A DAO decorator that prevents user from updating
        properties for which the user does not have the update permission`,
  
    methods: [
      {
        name: 'put_',
        javaCode: `
    AuthService auth = (AuthService) x.get("auth");
    String of = obj.getClass().getSimpleName().toLowerCase();
    FObject oldObj = getDelegate().find(obj.getProperty("id"));
  
    if ( oldObj != null ) {
      List list = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator e = list.iterator();
  
      while( e.hasNext() ) {
        PropertyInfo axiom = (PropertyInfo) e.next();
        if ( axiom.getPermissionRequired() ) {
          String axiomName =  axiom.toString();
          axiomName = axiomName.substring(axiomName.lastIndexOf(".") + 1);
          boolean hasPermission = auth.check(x, of + ".rw." + axiomName);
  
          if ( ! hasPermission ) {
            Object oldValue = oldObj.getProperty(axiomName);
            axiom.set(obj, oldValue);
          }
        }
      }
    }
  
    return super.put_(x, obj);
        `,
      },
  
      {
        name: 'find_',
        javaCode: `
    AuthService auth = (AuthService) x.get("auth");
    FObject oldObj = getDelegate().find(id);
    
    if ( oldObj != null ) {
      String of = oldObj.getClass().getSimpleName().toLowerCase();
      List list = oldObj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator e = list.iterator();
      FObject copiedObj = oldObj.fclone();
  
      while( e.hasNext() ) {
        PropertyInfo axiom = (PropertyInfo) e.next();
        if ( axiom.getPermissionRequired() ) {
          String axiomName =  axiom.toString();
          axiomName = axiomName.substring(axiomName.lastIndexOf(".") + 1);
          boolean hasPermission = ( auth.check(x, of + ".rw." + axiomName) || auth.check(x, of + ".ro." + axiomName) );
  
          if ( ! hasPermission ) {
            axiom.clear(copiedObj);
          }
        }
      }
  
      return copiedObj;
    }
    
    return super.find_(x, id);
        `,
      }
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
  