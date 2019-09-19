/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ClientLoginAuthService',

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  requires: [
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.auth.AuthService',
      factory: function() {
        return this.SessionClientBox.create({
          // Set this to false for calls to the auth service because we actually
          // want to know what the error was so we can display it to the user.
          promptUserToAuthenticate: false,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: this.serviceName
          })
        });
      }
    }
  ]
});
