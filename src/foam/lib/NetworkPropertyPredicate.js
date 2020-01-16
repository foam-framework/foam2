  foam.CLASS({
    package: 'foam.lib',
    name: 'NetworkPropertyPredicate',
    implements: [ 'foam.lib.PropertyPredicate'],

    methods: [
      {
        name: 'propertyPredicateCheck',
        javaCode: `
  return ! prop.getNetworkTransient();
  `
      }
    ]
  });
    