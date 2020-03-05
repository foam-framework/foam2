/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.comics.v2',
  name: 'EnabledActionsAuth',

  methods: [
    {
      name: 'getModelName',
      type: 'String',
    },
    {
      name: 'setModelName',
      args: [
        {
          name: 'value',
          type: 'String',
        }
      ]
    },
    {
      name: 'permissionFactory',
      type: 'String',
      args: [
        {
          name: 'operation',
          type: 'foam.nanos.ruler.Operations'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    }
  ]
});
