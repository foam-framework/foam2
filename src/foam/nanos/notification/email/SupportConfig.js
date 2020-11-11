/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SupportConfig',

  documentation: 'Support configuration for email',

  properties: [
    {
      class: 'foam.core.FObjectProperty',
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
