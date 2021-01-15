/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailConfig',

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    },
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'String',
      name: 'displayName'
    },
    {
      class: 'String',
      name: 'replyTo'
    }
  ]
});
