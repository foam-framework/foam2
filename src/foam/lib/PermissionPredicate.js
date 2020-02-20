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
        AuthService auth = (AuthService) getX().get("auth");
        if ( ! ( args_ != null && args_.length >= 0 ) ) {
          return true;
        }

        for (String permission : args_) {
          if ( auth.check(getX(), permission) )
            return true;
        }
        return false;
      `
    }
  ]

});