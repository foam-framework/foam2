foam.CLASS({
  package: 'com.google.foam.demos.appengine',
  name: 'TestModel',
  ids: ['name'],
  properties: [
    {
      class: 'String',
      name: 'name',
      javaType: 'String'
    },
    {
      class: 'Int',
      name: 'age',
      javaType: 'int'
    }
  ],
  methods: [
    {
      name: 'hello',
      code: function() {},
      args: [
        { name: 'name', javaType: 'String' }
      ],
      javaReturns: 'void',
      javaCode: function() {/*
System.out.println("Hello " + name);
                             */}
    }
  ]
});
