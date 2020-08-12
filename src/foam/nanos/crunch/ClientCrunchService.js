/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'ClientCrunchService',

  implements: [
    'foam.nanos.crunch.CrunchService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.crunch.CrunchService',
      name: 'delegate'
    }
  ]
});

