/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'BatchCmd',

  documentation: `See BatchClientDAO and BatchServerDAO.  The cmd captures a group of dao operations to be delegated together.`,

  properties: [
    {
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname");'
    },
    {
      name: 'dop',
      class: 'Enum',
      of: 'foam.dao.DOP',
      value: 'PUT'
    },
    {
      name: 'batch',
      class: 'Map',
    }
  ]
});
