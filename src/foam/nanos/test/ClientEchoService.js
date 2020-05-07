/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'ClientEchoService',
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.test.EchoService',
      name: 'delegate'
    }
  ]
});
