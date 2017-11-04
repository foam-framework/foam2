/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.register',
  name: 'ClientRegistrationService',

  implements: [
    'foam.nanos.register.RegistrationService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.register.RegistrationService',
      name: 'delegate'
    }
  ]
});