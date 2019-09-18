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

  documentation: 'ClientAuthService which uses custom AuthServiceClientBox as delegate',

  requires: [
    'foam.box.HTTPBox',
    'foam.box.AuthServiceClientBox',
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
        return this.AuthServiceClientBox.create({
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: this.serviceName
          })
        });
      }
    }
  ]
});
