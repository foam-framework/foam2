/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.ENUM({
    package: 'foam.nanos.crunch',
    name: 'AssociatedEntity',
    values: [
      {
        name: 'USER',
        label: 'user'
      },
      {
        name: 'REAL_USER',
        label: 'realUser'
      },
      {
        name: 'ACTING_USER',
        label: 'acting_user',
        documentation: `Denotes the special case where the associatedEntity of a capability should be
        some user acting as another user.`
      }
    ]
  });
    