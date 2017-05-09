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
      javaCode: `return Class.forName(serviceClass).newInstance();`
    }
  ]
})