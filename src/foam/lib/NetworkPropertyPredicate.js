foam.CLASS({
    package: 'foam.lib',
    name: 'NetworkPropertyPredicate',
    extends: 'foam.lib.PermissionedPropertyPredicate',
    javaImports: [
        'foam.nanos.auth.AuthService',
        'foam.lib.PermissionedPropertyPredicate'
    ],
    
    methods: [
      {
        name: 'propertyPredicateCheck',
        javaCode: `
        if ( prop.getNetworkTransient()) return false;
        return super.propertyPredicateCheck(x, fo, prop);
  `
      }
    ]
  });
    