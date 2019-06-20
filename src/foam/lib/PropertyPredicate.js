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
          name: 'of',
          type: 'String'
        },
        {
          name: 'prop',
          javaType: 'foam.core.PropertyInfo'
        }
      ]
    }
  ]
});
  