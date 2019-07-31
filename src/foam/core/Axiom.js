/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'Axiom',

  documentation: 'Represents an axiom',

  methods: [
    {
      name: 'getName',
      type: 'String',
    },
    {
      name: 'setClassInfo',
      type: 'Axiom',
      args: [ { name: 'p', type: 'ClassInfo' } ],
    },
    {
      name: 'getClassInfo',
      type: 'ClassInfo',
    },
    {
      name: 'toString',
      type: 'String',
    }
  ]
});
