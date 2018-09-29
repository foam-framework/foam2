/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build.output',
  name: 'ProxySerializer',
  implements: [
    'foam.build.output.CodeSerializer',
  ],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.build.output.CodeSerializer',
      name: 'delegate',
    }
  ],
});
