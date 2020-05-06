/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'foam.nanos.approval',
  name: 'ApprovalStatus',

  values: [
    {
      name: 'REQUESTED',
      label: 'Pending',
      documentation: 'Request pending.'
    },
    {
      name: 'APPROVED',
      label: 'Approved',
      documentation: 'Request was approved.'
    },
    {
      name: 'REJECTED',
      label: 'Rejected',
      documentation: 'Request was rejected.'
    },
    {
      name: 'CANCELLED',
      label: 'Cancelled',
      documentation: 'Request was cancelled.'
    }
  ]
});
