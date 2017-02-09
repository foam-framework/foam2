foam.CLASS({
  name: 'Test',
  requires: [
    'foam.swift.SwiftClass',
    'foam.swift.Field',
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
      var cls = this.model_.toSwiftClass();
      console.log(cls.toSwiftSource());
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
