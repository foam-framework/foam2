/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.swift.type',
  name: 'Type',
  properties: [
    {
      class: 'Int',
      name: 'ordinal'
    },
  ],
  methods: [
    {
      name: 'isInstance',
      args: [
        { name: 'o' },
      ],
      type: 'Boolean',
    },
    {
      name: 'compare',
      args: [
        { name: 'o1' },
        { name: 'o2' },
      ],
      swiftType: 'Int',
    },
  ],
});
