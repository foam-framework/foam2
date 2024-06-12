/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CreatedAwareMixin',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});
