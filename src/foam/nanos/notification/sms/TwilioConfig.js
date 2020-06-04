/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.notification.sms',
   name: 'TwilioConfig',

   properties: [
    {
      class: 'String',
      name: 'accountSid',
      documentation: 'Twilio account id'
    },
    {
      class: 'String',
      name: 'authToken',
      documentation: 'Twilio auth token'
    },
    {
      class: 'String',
      name: 'phoneNumber',
      documentation: 'Twilio phone number'
    }
  ]
 });
