foam.ENUM({
  package: 'foam.nanos.alarming',
  name: 'AlarmReason',

  values: [
    { name: 'NONE', label: ' No alarm' },
    { name: 'CONGESTION', label: 'Congestion' },
    { name: 'CREDENTIALS', label: 'Invalid credentials' },
    { name: 'TIMEOUT', label: 'A request timed out' },
    { name: 'MANUAL', label: 'Manually started alarm' },
    { name: 'TRANSACTION', label: 'Transaction has been in an unexpected state for too long' }
  ]
});
