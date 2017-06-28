/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Login',

  documentation: 'Login information.',

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 30,
      width: 100
    },
    {
      class: 'Password',
      name: 'password',
      displayWidth: 30,
      width: 100
    }
  ]
});
