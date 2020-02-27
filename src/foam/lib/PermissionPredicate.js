/**
@license
Copyright 2020 The FOAM Authors. All Rights Reserved.
http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.lib',
  name: 'PermissionPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  imports: [
    'auth',
  ],
  properties: [
    {
      name: 'permission',
      class: 'String'
    }
  ],
  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.AuthService'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, permission_) )
            return true;
        return false;
      `,
      code: async function() {
        var r = await this.auth.check(null, this.permission);
        if ( r )
          return true;

        return false;
      }
    }
  ]
});