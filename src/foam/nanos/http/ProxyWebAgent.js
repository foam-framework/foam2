/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.http',
  name: 'ProxyWebAgent',
  implements: [ 'foam.nanos.http.WebAgent' ],

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.http.WebAgent',
      name: 'delegate'
    }
  ]
});
