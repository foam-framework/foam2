/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.notification.sms',
   name: 'SMSMessage',

   documentation: 'SMS message',

   properties: [
     {
       class: 'FObjectProperty',
       of: 'foam.nanos.auth.User',
       name: 'user'
     },
     {
       class: 'String',
       name: 'message'
     },
     {
       class: 'String',
       name: 'phoneNumber'
     }
   ]
 });
