/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net',
  name: 'Host',

  documentation: 'Represents a network /etc/hosts entry',

  properties: [
    {
      name: 'id',
      class: 'String',
      label: 'Name',
      value: 'localhost',
      required: true
    },
    {
      documentation: 'IP or DNS name',
      name: 'address',
      class: 'String',
      value: '127.0.0.1',
      required: true
    }
  ]
});
