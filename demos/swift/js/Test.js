foam.CLASS({
  name: 'Test',
  requires: [
    'foam.core.Slot',
    'foam.core.Model',
    'foam.swift.SwiftClass',
    'foam.swift.Field',
    'foam.swift.Method',
    'foam.swift.ui.DetailViewGenerator',
  ],
  messages: [
    {
      name: 'greeting',
      message: 'Hello there ${first} ${last}',
      description: 'Greeting where ${last} is last name and ${first} is first.',
    },
  ],
  properties: [
    {
      class: 'String',
      name: 'firstName',
      value: 'Mike',
    },
    {
      class: 'String',
      name: 'lastName',
      value: 'Carcasole',
    },
    {
      name: 'factoryProp',
      swiftFactory: function() {/*
    return ["Hello", "World"]
      */},
    },
  ],
  actions: [
    {
      name: 'sayHi',
      code: function() { console.log(this.greeting); },
      swiftCode: 'NSLog(type(of: self).greeting, firstName, lastName)',
    },
  ],
  methods: [
    function execute() {
      var cls = this.SwiftClass.create({
        name: 'Test',
        methods: [
          this.Method.create({
            name: 'getName',
            body: 'return "hello"',
          })
        ],
      });
      for (var i = 0; i < 1000; i++) {
        cls.name = 'Test' + i;
        cls.methods[0].body = 'return "Hello'+i+'"';
        console.log(cls.toSwiftSource());
      }
    },
    {
      name: 'myMethod',
      swiftReturnType: 'String',
      args: [
        {
          name: 'name',
          swiftType: 'String',
        },
      ],
      swiftCode: function() {/*
    NSLog("%@", factoryProp.debugDescription)
    return name
      */},
    },
  ]
});
