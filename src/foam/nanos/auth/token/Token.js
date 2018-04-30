/**
 * @license
 * Copyright 20188 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'Token',

  documentation: 'Represents a one-time access code linked to a specific User',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      name: 'userId',
      of: 'foam.nanos.auth.User',
    },
    {
      class: 'Boolean',
      name: 'processed',
      value: false
    },
    {
      class: 'Date',
      name: 'expiry',
      documentation: 'The token expiry date'
    },
    {
      class: 'String',
      name: 'data',
      documentation: 'The token data'
    },
    {
      class: 'Map',
      name: 'parameters',
      documentation: 'Additional token parameters'
    }
  ]
});
