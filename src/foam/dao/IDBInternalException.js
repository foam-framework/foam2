/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'IDBInternalException',
  extends: 'foam.dao.InternalException',

  // TODO: Which errors are internal (system problems) vs. external
  // (i.e. invalid data for clone, but you can try again with different data)
  properties: [
    'id',
    'error',
    {
      name: 'message',
      expression: function(id, error) {
        return "IndexedDB Error for " + id +
          ( error ? ": " + error.toString() : "" );
      }
    }
  ]
});
