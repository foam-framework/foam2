/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.sms',
  name: 'ProxySMSService',

  documentation: 'This class is used for the purpose of decorating the sms(service)',

  implements: [
    'foam.nanos.notification.sms.SMSService'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.notification.sms.SMSService',
      name: 'delegate'
    }
  ]
});
