/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'SupportConfig',

  documentation: 'Support configuration for email',

  properties: [
    {
      class: 'FObjectProperty',
      of:'foam.nanos.app.EmailConfig',
      name: 'emailConfig'
    },
    {
      class: 'String',
      name: 'supportEmail'
    },
    {
      class: 'String',
      name: 'supportPhone'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'personalSupportUser'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'supportAddress',
      factory: function() {
        return foam.nanos.auth.Address.create({}, this);
      }
    }
  ]
});
