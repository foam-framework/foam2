/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.strategy',
  name: 'ClientStrategizerService',

  implements: [
    'foam.strategy.StrategizerService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.strategy.StrategizerService',
      name: 'delegate'
    }
  ]
});
