foam.CLASS({
    package: 'foam.lib',
    name: 'PermissionedPropertyPredicate',
    implements: [ 'foam.lib.PropertyPredicate'],
    javaImports: [
      'foam.nanos.auth.AuthService'
    ],
    
    methods: [
      {
        name: 'propertyPredicateCheck',
        type: 'boolean',
        args: [
         {
            name: 'x',
            type: 'foam.core.X'
          },
          {
            name: 'fo',
            type: 'FObject'
          },
          {
            name: 'prop',
            type: 'foam.core.PropertyInfo'
          }
        ],
        javaCode: `
  if ( prop.getPermissionRequired() ) {
    String propName = prop.getName().toLowerCase();
    String of = fo.getClass().getSimpleName().toLowerCase();
    AuthService auth = (AuthService) x.get("auth");
    return auth.check(x,  of + ".ro." + propName) || auth.check(x,  of + ".rw." + propName);
  }

  return true;
  `
      }
    ]
  });
    