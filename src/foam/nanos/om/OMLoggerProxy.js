/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMLoggerProxy',
  implements: [ 'foam.nanos.om.OMLogger' ],

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.om.OMLogger',
      name: 'delegate'
    }
  ]
});
