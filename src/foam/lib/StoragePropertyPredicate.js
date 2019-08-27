foam.CLASS({
  package: 'foam.lib',
  name: 'StoragePropertyPredicate',
  implements: [ 'foam.lib.PropertyPredicate'],
  javaImports: [
    'foam.nanos.auth.AuthService'
  ],

  methods: [
    {
      name: 'propertyPredicateCheck',
      javaCode: `
return ! prop.getStorageTransient();
`
    },
    {
      name: 'propertyPredicateCheckForFields',
           javaCode: `
     return ! prop.getStorageTransient();
     `
    }
  ]
});
