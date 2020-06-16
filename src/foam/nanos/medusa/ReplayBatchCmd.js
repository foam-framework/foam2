/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayBatchCmd',
  extends: 'foam.nanos.medusa.BatchCmd',

  properties: [
    {
      name: 'details',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ReplayDetailsCmd'
    },
    {
      name: 'batch',
      class: 'Map'
    }
  ]
});
