/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.mlang.order',
  name: 'Comparator',

  documentation: 'Interface for comparing two values: -1: o1 < o2, 0: o1 == o2, 1: o1 > o2.',

  methods: [
    {
      name: 'compare',
      swiftReturns: 'Int',
      args: [
        'o1',
        'o2'
      ]
    },
    {
      flags: ['js', 'java'],
      name: 'toIndex',
      args: [
        'tail'
      ]
    },
    {
      // TODO: why is this here?
      /** Returns remaning ordering without this first one, which may be the
        only one. */
      flags: ['js', 'java'],
      name: 'orderTail'
    },
    {
      // TODO: why is this here?
      /** The property, if any, sorted by this ordering. */
      flags: ['js', 'java'],
      name: 'orderPrimaryProperty'
    },
    {
      // TODO: why is this here?
      /** Returns 1 or -1 for ascending/descending */
      flags: ['js', 'java'],
      name: 'orderDirection'
    }
  ]
});
