/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PriorPassword',

  documentation: 'Prior hashed password value for a user.',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'timeStamp',
      updateMode: 'RO',
      documentation: 'Time at which password entry was created'
    },
    {
      class: 'Password',
      name: 'password',
      documentation: 'Hashed password value.'
    },
  ]
 });
