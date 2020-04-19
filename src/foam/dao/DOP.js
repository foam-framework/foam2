/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.dao',
  name: 'DOP',

  documentation: 'Enum of DAO Operations',

  values: [
    {
      name: 'PUT',
      label: 'put'
    },
    {
      name: 'PUT_',
      label: 'put_'
    },
    {
      name: 'FIND',
      label: 'find'
    },
    {
      name: 'FIND_',
      label: 'find_'
    },
    {
      name: 'SELECT',
      label: 'select'
    },
    {
      name: 'SELECT_',
      label: 'select_'
    },
    {
      name: 'REMOVE',
      label: 'remove'
    },
    {
      name: 'REMOVE_',
      label: 'remove_'
    },
    {
      name: 'REMOVE_ALL',
      label: 'removeAll'
    },
    {
      name: 'REMOVE_ALL_',
      label: 'removeAll_'
    },
    {
      name: 'CMD',
      label: 'cmd'
    },
    {
      name: 'CMD_',
      label: 'cmd_'
    }
  ]
});
