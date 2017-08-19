foam.INTERFACE({
  refines: 'foam.box.Box',
  methods: [
    {
      name: 'send',
      args: [
        {
          name: 'obj',
          swiftType: 'Message'
        }
      ],
      swiftEnabled: true,
    },
  ]
});

foam.CLASS({
  refines: 'foam.box.RPCReturnBox',
  methods: [
    {
      name: 'send',
      swiftCode: function() {/*
// TODO
      */},
    },
  ],
});
