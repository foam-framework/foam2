foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'OMName',
  ids: ['name'],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public OMName(String name) {
            setName(name);
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ]
});
