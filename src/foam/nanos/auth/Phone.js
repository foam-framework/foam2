/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Phone',

  documentation: 'Phone number information.',

  properties: [
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'PhoneNumber',
      name: 'number',
      required: true
    }
  ]
});
