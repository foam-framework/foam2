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
      name: 'from',
      value: 'info@nanopay.net'
    },
    {
      class: 'String',
      name: 'displayName',
      value: 'nanopay Corporation'
    },
    {
      class: 'String',
      name: 'replyTo',
      value: 'noreply@nanopay.net'
    }
  ]
});
