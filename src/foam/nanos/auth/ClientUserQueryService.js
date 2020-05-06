/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ClientUserQueryService',
  documentation: `
    A version of the UserQueryService which can be served on the client side
    to query users in the GUI
  `,

  implements: [
    'foam.nanos.auth.UserQueryService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.auth.UserQueryService',
      name: 'delegate'
    }
  ]
});
