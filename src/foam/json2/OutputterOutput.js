foam.INTERFACE({
  package: 'foam.json2',
  name: 'OutputterOutput',
  methods: [
    {
      name: 'startObj',
    },
    {
      name: 'endObj',
    },
    {
      name: 'startArray',
    },
    {
      name: 'endArray',
    },
    {
      name: 'keySep',
    },
    {
      name: 'out',
      args: [ { name: 's', swiftType: 'String' } ],
    },
    {
      name: 'comma',
    },
    {
      name: 'output',
      swiftReturns: 'String',
    },
  ],
})
