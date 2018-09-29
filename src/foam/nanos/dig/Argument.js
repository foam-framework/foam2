/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'Argument',

  properties: [
   {
    class: 'String',
    name: 'name',
    visibility: foam.u2.Visibility.RO
   },
   {
     class: 'String',
     name: 'javaType',
     visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'value'
    }
  ],

  methods: [
  ]
});
