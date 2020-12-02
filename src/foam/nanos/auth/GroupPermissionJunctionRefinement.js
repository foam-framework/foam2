/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'GroupPermissionJunctionRefinement',

  refines: 'foam.nanos.auth.GroupPermissionJunction',

  implements: [ 'foam.nanos.auth.Authorizable' ],

  imports: [ 'auth' ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group'
  ],

  messages: [
    {
      name: 'LACKS_PERMISSION',
      message: 'Permission denied. You cannot add or remove a permission that you do not have.'
    },
    {
      name: 'CANNOT_UPDATE_GROUP',
      message: 'You do not have permission to update that group.'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: 'check(x);'
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        // It's fine for anyone to see how permissions relate to groups.
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        // This should never get called because if either the sourceId or
        // targetId changes then it's a new id altogether and therefore it's a
        // create, not an update.

        // Call check just in case this ever does get hit.
        check(x);
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: 'check(x);'
    },
    {
      name: 'check',
      args: [
        {
          type: 'Context',
          name: 'x'
        }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        String permissionId = String.format("group.update.%s", getSourceId());

        if ( ! auth.check(x, permissionId) ) {
          throw new AuthorizationException(CANNOT_UPDATE_GROUP);
        }

        if ( ! auth.check(x, getTargetId()) ) {
          throw new AuthorizationException(LACKS_PERMISSION);
        }
      `
    }
  ]
});
