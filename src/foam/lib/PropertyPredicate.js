foam.INTERFACE({
  package: 'foam.lib',
  name: 'PropertyPredicate',

  methods: [
    {
      name: 'propertyPredicateCheck',
      type: 'boolean',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'fo',
          type: 'FObject'
        },
        {
          name: 'prop',
          type: 'foam.core.PropertyInfo'
        }
      ]
    }
  ]
});
  