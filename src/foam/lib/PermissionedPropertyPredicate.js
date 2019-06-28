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
      javaCode: `
if ( prop.getPermissionRequired() ) {
  String propName = prop.getName().toLowerCase();
  AuthService auth = (AuthService) x.get("auth");
  return ( auth != null ) ? (auth.check(x,  of + ".ro." + propName) || auth.check(x,  of + ".rw." + propName)) : false;
}

return true;
`
    }
  ]
});
  