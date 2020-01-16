foam.CLASS({
  package: 'foam.lib',
  name: 'StoragePropertyPredicate',
  implements: [ 'foam.lib.PropertyPredicate'],

  methods: [
    {
      name: 'propertyPredicateCheck',
      javaCode: `
return ! prop.getStorageTransient();
`
    }
  ]
});
