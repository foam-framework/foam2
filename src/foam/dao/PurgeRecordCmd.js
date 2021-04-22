/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PurgeRecordCmd',
  documentation: `
    This model is passed to the dao cmd_ method to specify an individual
    item to be purged from the cache.
  `,

  properties: [
    {
      class: 'Object',
      name: 'id'
    }
  ]
});