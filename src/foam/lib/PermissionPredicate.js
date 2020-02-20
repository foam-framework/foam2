foam.CLASS({
  package: 'foam.lib',
  name: 'PermissionPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
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
        if ( args_ == null || args_.length <= 0 ) {
          return true;
        }

        for (String permission : args_) {
          if ( auth.check(getX(), permission) )
            return true;
        }
        return false;
      `,
      code: async function() {
        if (!this.args || this.args.length <= 0)
          return true;
        
        for ( var  i = 0 ; i < this.args.length ; i++) {
          if ( await this.__subContext__.auth.check(this.__subContext__, this.args[i]) )
           return true;
        }
        return false;
      }
    }
  ]

});