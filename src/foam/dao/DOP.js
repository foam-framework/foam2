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
      value: 'find'
    },
    {
      name: 'FIND_',
      value: 'find_'
    },
    {
      name: 'SELECT',
      value: 'select'
    },
    {
      name: 'SELECT_',
      value: 'select_'
    },
    {
      name: 'REMOVE',
      value: 'remove'
    },
    {
      name: 'REMOVE_',
      value: 'remove_'
    },
    {
      name: 'REMOVE_ALL',
      value: 'removeAll'
    },
    {
      name: 'REMOVE_ALL_',
      value: 'removeAll_'
    },
    {
      name: 'CMD',
      value: 'cmd'
    },
    {
      name: 'CMD_',
      value: 'cmd_'
    }
  ]
});
