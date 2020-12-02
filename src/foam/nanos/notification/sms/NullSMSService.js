/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.sms',
  name: 'NullSMSService',

  implements: [
    'foam.nanos.notification.sms.SMSService'
  ],

  methods: [
    {
      name: 'send',
      javaCode: 'return smsMessage;',
      code: function() {
        // NOP
      }
    }
  ]
});
