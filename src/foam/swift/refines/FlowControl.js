foam.CLASS({
  refines: 'foam.dao.FlowControl',
  methods: [
    {
      name: 'stop',
      swiftCode: 'setStopped(true)'
    }
  ]
});
