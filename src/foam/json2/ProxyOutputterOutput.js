/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.json2',
  name: 'ProxyOutputterOutput',
  implements: [
    'foam.json2.OutputterOutput'
  ],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.json2.OutputterOutput',
      name: 'delegate',
    },
  ],
})
