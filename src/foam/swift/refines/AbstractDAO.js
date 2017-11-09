/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
