/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Country',

  documentation: 'Country information.',

  ids: [ 'code' ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'name'
    }
  ]
});
