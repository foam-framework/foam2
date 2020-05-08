/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.auth',
  name: 'LifecycleState',

  values: [
    {
      name: 'PENDING',
      label: 'Pending'
    },
    {
      name: 'ACTIVE',
      label: 'Active'
    },
    {
      name: 'REJECTED',
      label: 'Rejected'
    },
    {
      name: 'DELETED',
      label: 'Deleted'
    }
  ]
});
