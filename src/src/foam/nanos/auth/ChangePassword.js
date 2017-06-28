/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ChangePassword',

  documentation: 'Login information.',

  properties: [
    {
      class: 'Password',
      name: 'oldPassword',
      displayWidth: 30,
      width: 100
    },
    {
      class: 'Password',
      name: 'newPassword',
      displayWidth: 30,
      width: 100
      // TODO: custom view
    }
  ]
});
