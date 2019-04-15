foam.INTERFACE({
  package: 'foam.nanos.analytics',
  name: 'FoldManager',
  methods: [
    {
      name: 'foldForState',
      args: [
        {
          type: 'Object',
          name: 'key'
        },
        {
          type: 'DateTime',
          name: 'time'
        },
        {
          type: 'Float',
          name: 'value'
        }
      ]
    }
  ]
});