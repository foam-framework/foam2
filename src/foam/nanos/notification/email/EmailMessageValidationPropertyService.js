/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessageValidationPropertyService',

  documentation: 'Checks if email properties such as Subject, Body, To, From are set',

  implements: [
      'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'java.security.InvalidParameterException'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `

        // TO:
        if ( ! emailMessage.isPropertySet("to") ) {
          throw new InvalidParameterException("To property is not set");
        }

        //SUBJECT:
        if ( ! emailMessage.isPropertySet("subject") ) {
          throw new InvalidParameterException("Subject property is not set");
        }

        //BODY:
        if ( ! emailMessage.isPropertySet("body") ) {
          throw new InvalidParameterException("Body property is not set");
        }

        return emailMessage;
      `
    }
  ]
})
