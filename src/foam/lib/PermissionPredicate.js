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
        return auth.check(x, permission_);
      `,
      code: async function(objId) {    
        /**
         * % is a character gets replaced in the permission string with 
         * the object id of the object you are trying to view    
         */
        if ( this.permission.includes('.%') && objId ){
          var permissionForObject = this.permission.replace('.%', '.' + objId);
          return await this.auth.check(null, permissionForObject);
        }
        return await this.auth.check(null, this.permission);
      }
    }
  ]
});