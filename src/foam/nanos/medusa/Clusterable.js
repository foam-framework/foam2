/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'Clusterable',

  documentation: `Per object instance control over clustering. Consider Sessions, some are to be clustered, others not.`,
  methods: [
    {
      name: 'getClusterable',
      type: 'Boolean'
    },
    {
      name: 'setClusterable',
      args: [
        {
          name: 'value',
          type: 'Boolean'
        }
      ]
    },
  ]
});

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterableDummy',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'clusterable'
    }
  ]
});
