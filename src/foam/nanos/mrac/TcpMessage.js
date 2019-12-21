/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'TcpMessage',
  extends: 'foam.box.Message',
  documentation: '',

  properties: [
    {
      class: 'String',
      name: 'serviceKey'
    },
    {
      class: 'String',
      name: 'serviceName'
    }
  ]
});
