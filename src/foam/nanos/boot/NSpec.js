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
      returnType: 'NanoService',
      javaSource: `return Class.forName(serviceClass).newInstance();`
    }
  ]
})