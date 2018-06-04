/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessage',

  documentation: 'Email message',

  properties: [
    {
      class: 'StringArray',
      name: 'to'
    },
    {
      class: 'StringArray',
      name: 'cc',
    },
    {
      class: 'StringArray',
      name: 'bcc'
    },
    {
      class: 'String',
      name: 'subject'
    },
    {
      class: 'String',
      name: 'body'
    }
  ]
});
