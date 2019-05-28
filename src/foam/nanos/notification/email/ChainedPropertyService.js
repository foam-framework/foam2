/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ChainedPropertyService',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  documentation:
  `Model that stores the array of decorators that fills the emailMessage
   with service level precedence on properties.`,

  javaImports: [
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  properties: [
    {
      name: 'data',
      class: 'FObjectArray',
      of: 'EmailPropertyService'
    }
  ],

  methods: [
    {
      name: 'apply',
      javaCode:
      `
      EmailPropertyService[] propertyApplied = getData();
      for ( EmailPropertyService eps: propertyApplied ) {
        emailMessage = eps.apply(x, group, emailMessage, templateArgs);
      }
      return emailMessage;
      `
    }
  ]
});
