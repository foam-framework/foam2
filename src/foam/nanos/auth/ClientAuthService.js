/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ClientAuthService',

  implements: [
    'foam.nanos.auth.WebAuthService'
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.auth.WebAuthService',
      factory: function() {
        return this.SessionClientBox.create({delegate:this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })});
      }
    }
  ]
});
