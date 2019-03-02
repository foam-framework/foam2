foam.INTERFACE({
  package: 'foam.lib',
  name: 'PropertyPredicate',

  methods: [
    {
      name: 'propertyPredicateCheck',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'fo',
          type: 'FObject'
        },
        {
          name: 'prop',
          javaType: 'foam.core.PropertyInfo'
        }
      ]
    }
  ]
});
  