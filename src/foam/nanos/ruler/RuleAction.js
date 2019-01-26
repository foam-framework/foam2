foam.INTERFACE({
  package: 'foam.nanos.ruler',
  name: 'RuleAction',

  methods: [
    {
      name: 'applyAction',
      javaReturns: 'void',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'obj', javaType: 'foam.core.FObject' }
      ]
    }
  ]
});
