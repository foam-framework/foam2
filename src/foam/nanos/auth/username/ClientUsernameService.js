/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.username',
  name: 'ClientUsernameService',

  implements: [
    'foam.nanos.auth.username.UsernameServiceInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.auth.username.UsernameServiceInterface',
      name: 'delegate'
    }
  ]
});
