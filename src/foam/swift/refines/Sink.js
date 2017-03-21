foam.INTERFACE({
  refines: 'foam.dao.Sink',
  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        },
        {
          name: 'fc',
          swiftType: 'FlowControl'
        },
      ],
      swiftEnabled: true,
    },
    {
      name: 'eof',
      swiftEnabled: true,
    },
    {
      name: 'swiftSinkError',
      swiftEnabled: true,
    },
    {
      name: 'reset',
      swiftEnabled: true,
    },
  ]
});
