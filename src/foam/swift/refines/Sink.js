foam.INTERFACE({
  refines: 'foam.dao.Sink',
  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'sub',
          swiftType: 'Subscription'
        },
        {
          name: 'obj',
          swiftType: 'FObject'
        },
      ],
      swiftEnabled: true,
    },
    {
      name: 'remove',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        },
      ],
      swiftEnabled: true,
    },
    {
      name: 'eof',
      swiftEnabled: true,
    },
    {
      name: 'error',
      swiftName: 'foamError',
      swiftEnabled: true,
    },
    {
      name: 'reset',
      swiftEnabled: true,
    },
  ]
});
