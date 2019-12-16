/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ORBRequest',
  documentation : 'ORBRequest objects are used to pass method call arguments to ORBitalDAOs request brokers.',
  flags: ['java'],

  javaImports: [
    'foam.core.FObject'
  ],

  properties: [
    {
      name: 'receiverObject',
      class: 'FObjectProperty',
      documentation: 'receiverObject can be the ID of the Object or a direct reference to it.'
    },
    {
      name: 'receiverObjectID',
      class: 'String'
    },
    {
      name: 'methodName',
      class: 'String'
    },
    {
      name: 'args',
      class: 'Array'
    }
  ]

});
