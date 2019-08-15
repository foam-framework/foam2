foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsCredientials',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'apiKey'
    }
  ]
});
