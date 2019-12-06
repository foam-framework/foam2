foam.ENUM({
  package: 'foam.nanos.auth.lifecycleAware',
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
