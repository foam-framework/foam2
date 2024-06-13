
foam.CLASS({
  package: 'foam.test.testdata',
  name: 'TestDataPopulator',

  javaImports: [
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'stringProducers',
      class: 'Map',
      javaType: 'java.util.Map<String,foam.test.testdata.StringProducer>',
      javaFactory: `
        Map<String,foam.test.testdata.StringProducer> m = new HashMap<String, foam.test.testdata.StringProducer>();
        // The string producers for properties with these names can be assumed
        m.put("firstName", new foam.test.testdata.RandomFirstNameProducer());
        m.put("lastName", new foam.test.testdata.RandomLastNameProducer());
        m.put("email", new foam.test.testdata.RandomEmailProducer());

        return m;
      `
    },
    {
      name: 'lastNameProducer',
      type: 'foam.test.testdata.StringProducer',
      factory: function () {
        return foam.test.testdata.RandomLastNameGenerator.create();
      },
      javaFactory: `
        return new foam.test.testdata.RandomLastNameProducer();
      `
    }
  ],

  methods: [
    {
      name: 'populateFObject',
      args: [
        {
          name: 'obj',
          type: 'foam.core.FObject',
        }
      ],
      javaCode: `
        StringProducer defaultString = new RandomHexStringProducer();
        List<foam.core.PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          if ( prop.getValueClass() == String.class ) {
            // If a string producer was specified for this property, use it
            if ( getStringProducers().containsKey(prop.getName()) ) {
              prop.set(obj, getStringProducers().get(prop.getName()).nextValue());
              continue;
            }
            // Otherwise, use the default string producer
            prop.set(obj, defaultString.nextValue());
          }
        }
      `
    },

    function randEntry_(listName) {
      return this[listName][
        Math.floor(Math.random() * this[listName].length)];
    }
  ]
})