foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'NSpec',

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'serviceClass'
    }
    // TODO: permissions, keywords, lazy, parent
  ],

  methods: [
    {
      name: 'createService',
      javaReturns: 'foam.nanos.NanoService',
      javaCode: `return (foam.nanos.NanoService) Class.forName(getServiceClass()).newInstance();`,
      javaThrows: [
        'java.lang.ClassNotFoundException',
        'java.lang.InstantiationException',
        'java.lang.IllegalAccessException'
      ],
    }
  ]
})