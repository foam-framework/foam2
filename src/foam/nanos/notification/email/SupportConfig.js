/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
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
    }
  ]
});
