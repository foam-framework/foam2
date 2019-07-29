foam.CLASS({
  package: 'foam.lib',
  name: 'DigColumnsPropertyPredicate',
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
    },
    {
      name: 'propertyPredicateCheckForDig',
      javaCode: `
      String[] digColumns_ = digColumns.split(",");

      for ( int i = 0; i < digColumns_.length; i++ ) {
         if ( digColumns_[i].equals(prop.getName()) )
          return true;
      }
      return false;
`
    }
  ]
});
