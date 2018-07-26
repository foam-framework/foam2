/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DigPostParameters',

  documentation: 'PUT or POST parameters passed to DIG in the HTTP content which require explicit processing when the Content-Type is application/json or application/xml',

  properties: [
    {
      name: 'cmd',
      class: 'String'
    },
    {
      name: 'dao',
      class: 'String'
    },
    {
      name: 'data',
      class: 'Object'
    },
    {
      name: 'email',
      class: 'String'
    },
    {
      name: 'format',
      class: 'String'
    },
    {
      name: 'id',
      class: 'String'
    }
  ]
});
