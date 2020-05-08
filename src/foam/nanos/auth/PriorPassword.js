/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PriorPassword',

  documentation: 'Prior hashed password value for a user.',

  properties: [
    {
      class: 'DateTime',
      name: 'timeStamp',
      updateVisibility: 'RO',
      documentation: 'Time at which password entry was created'
    },
    {
      class: 'Password',
      name: 'password',
      documentation: 'Hashed password value.'
    },
  ]
 });
