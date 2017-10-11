/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.mlang.order',
  name: 'Comparator',

  implements: [ 'foam.dao.SQLStatement' ],

  javaExtends: [ 'java.util.Comparator' ],

  methods: [
    {
      name: 'compare',
      javaReturns: 'int',
      args: [
        {
          name: 'o1',
          javaType: 'Object'
        },
        {
          name: 'o2',
          javaType: 'Object'
        }
      ]
    },
  ]
});
