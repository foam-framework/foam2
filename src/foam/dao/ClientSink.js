/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ClientSink',
  implements: [ 'foam.dao.Sink' ],
  properties: [
    {
      class: 'Stub',
      of: 'foam.dao.Sink',
      name: 'delegate',
      notifications: [ 'put', 'remove', 'eof', 'reset' ]
    }
  ]
});
