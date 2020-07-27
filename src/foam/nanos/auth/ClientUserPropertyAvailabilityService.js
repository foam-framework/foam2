/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ClientUserPropertyAvailabilityService',

  implements: [
    'foam.nanos.auth.UserPropertyAvailabilityServiceInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.auth.UserPropertyAvailabilityServiceInterface',
      name: 'delegate'
    }
  ]
});
