/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.alarming',
  name: 'AlarmReason',

  values: [
    { name: 'UNSPECIFIED', label: 'Unspecified' },
    { name: 'CONGESTION', label: 'Congestion' },
    { name: 'CREDENTIALS', label: 'Invalid credentials' },
    { name: 'TIMEOUT', label: 'Request timed out' },
    { name: 'MANUAL', label: 'Manually started alarm' },
    { name: 'TRANSACTION', label: 'Transaction has been in an unexpected state for too long' },
    { name: 'NSF', label: 'Not sufficient funds' },
    { name: 'UNSUPPORTED', label: 'Unsupported request' },
    { name: 'CONFIGURATION', label: 'Invalid Configuration' }
  ]
});
