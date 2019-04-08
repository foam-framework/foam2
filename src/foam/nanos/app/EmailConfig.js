/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'EmailConfig',

  properties: [
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'String',
      name: 'displayName'
    },
    {
      class: 'String',
      name: 'replyTo'
    }
  ]
});
