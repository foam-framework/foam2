/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'ClientEmailDocService',
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.auth.email.EmailDocInterface',
      name: 'delegate'
    }
  ]
});
