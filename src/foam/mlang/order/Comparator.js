/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.mlang.order',
  name: 'Comparator',

  documentation: 'Interface for comparing two values: -1: o1 < o2, 0: o1 == o2, 1: o1 > o2.',

  implements: [ 'foam.dao.SQLStatement' ],

  javaImplements: [ 'java.util.Comparator' ],
  
  methods: [
    {
      name: 'compare',
      type: 'Integer',
      args: [ { name: 'o1', type: 'Any' },
              { name: 'o2', type: 'Any' } ]
    }
  ]
});
