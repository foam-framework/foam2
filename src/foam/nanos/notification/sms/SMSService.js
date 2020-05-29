/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
   package: 'foam.nanos.notification.sms',
   name: 'SMSService',

   methods: [
     {
       name: 'send',
       async: true,
       type: 'foam.nanos.notification.sms.SMSMessage',
       args: [
         {
           name: 'x',
           type: 'Context'
         },
         {
           name: 'smsMessage',
           type: 'foam.nanos.notification.sms.SMSMessage'
         }
       ]
     }
   ]
 });
