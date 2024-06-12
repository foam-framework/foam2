/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'ProxyWAO',
  implements: [ 'foam.u2.wizard.WAO' ],
  flags: ['web'],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.u2.wizard.WAO',
      name: 'delegate'
    }
  ]
});
