/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.comics.v2',
  name: 'EnabledActionsAuth',
  documentation: `
    An interface where you can define how front-end CRUD permissions for actions can be generated,
    to be used in conjuction with the isEnabled method of CRUD actions for the DAOController
  `,

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
