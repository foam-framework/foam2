foam.INTERFACE({
  package: 'foam.core',
  name: 'Validator',
  methods: [
    {
      name: 'validate',
      type: 'Void',
      javaThrows: [ 'IllegalStateException' ],
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ]
    }
  ]
})
