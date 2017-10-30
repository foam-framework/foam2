/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.dao.AbstractDAO',
  methods: [
    // Here to finish implementing the interface.
    { name: 'select_' },
    { name: 'put_' },
    { name: 'remove_' },
    { name: 'find_' },
    { name: 'removeAll_' },
  ],
})

foam.CLASS({
  refines: 'foam.dao.DAOProperty',
  properties: [
    {
      name: 'swiftType',
      expression: function(required) {
        return '(DAO & FObject)' + (required ? '' : '?');
      },
    },
  ],
});
