foam.CLASS({
    package: 'foam.lib',
    name: 'StoragePropertyPredicate',
    extends: 'foam.lib.PermissionedPropertyPredicate',
    javaImports: [
        'foam.nanos.auth.AuthService',
        'foam.lib.PermissionedPropertyPredicate'
    ],
    
    methods: [
      {
        name: 'propertyPredicateCheck',
        javaCode: `
        if ( prop.getStorageTransient()) return false;
        return super.propertyPredicateCheck(x, fo, prop);
  `
      }
    ]
  });
    