/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'ProxyLogger',
  implements: [ 'foam.nanos.logger.Logger' ],

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.logger.Logger',
      name: 'delegate'
    }
  ]
});
