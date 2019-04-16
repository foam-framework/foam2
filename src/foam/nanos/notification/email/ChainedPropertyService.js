/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ChainedPropertyService',

  documentation: `
  Model that stores the array of decorators that fills the emailMessage
  with service level precedence on properties.`,

  properties: [
    {
      name: 'data',
      class: 'FObjectArray',
      of: 'foam.nanos.notification.email.EmailPropertyService'
    }
  ]
});
