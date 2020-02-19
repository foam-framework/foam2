foam.CLASS({
  package: 'foam.lib',
  name: 'PermissionPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  properties: [
    {
      name: 'args',
      class: 'StringArray'
    }
  ],
  javaImports: [
    'foam.nanos.auth.AuthService'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! ( args != null && args.length >= 0 ) ) {
          return true;
        }

        for (String permission : args) {
          if ( auth.check(x, permission) )
            return true;
        }
        

        return false;
      `
    }
  ]

});