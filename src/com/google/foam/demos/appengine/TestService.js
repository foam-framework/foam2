foam.INTERFACE({
  package: 'com.google.foam.demos.appengine',
  name: 'TestService',
  methods: [
    {
      name: 'doLog',
      returns: '',
      javaReturns: 'void',
      args: [
        {
          name: 'message',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'setValue',
      returns: '',
      javaReturns: 'void',
      args: [
        {
          name: 'value',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'getValue',
      returns: 'Promise',
      javaReturns: 'String',
      args: []
    }
  ]
});
