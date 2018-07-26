/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'CreatedAware',

  properties: [
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date'
    }
  ]
});
