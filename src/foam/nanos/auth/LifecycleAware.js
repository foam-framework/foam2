foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LifecycleAware',

  methods: [
    {
      name: 'getLifecycleState',
      type: 'foam.nanos.auth.LifecycleState',
    },
    {
      name: 'setLifecycleState',
      args: [
        {
          name: 'value',
          type: 'foam.nanos.auth.LifecycleState',
        }
      ]
    }
  ]
});
