/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'ClientTokenService',

  implements: [
    'foam.nanos.auth.token.TokenService',
  ],
  import: [
    'registry'
  ],
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.auth.token.TokenService',
      name: 'delegate'
    }
  ]
});
