/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ChainedTemplateService',

  properties: [
    {
      name: 'data',
      class: 'FObjectArray',
      of: 'foam.nanos.notification.email.EmailPropertyService'
    }
  ]
});
