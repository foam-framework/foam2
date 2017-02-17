foam.CLASS({
  name: 'Test',
  requires: [
    'foam.core.Slot',
    'foam.core.Model',
    'foam.swift.SwiftClass',
    'foam.swift.Field',
    'foam.swift.Method',
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
      swiftPostSet: function() {/*
NSLog("Hi there %@", newValue)
      */},
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
      var cls = this.lookup(this.model_.id);
      console.log(cls.toSwiftClass().toSwiftSource());
      /*
      var cls = this.SwiftClass.create({
        name: 'Test',
        implements: ['FObject'],
        methods: [
          this.Method.create({
            name: 'getName',
            body: 'return "hello"',
          })
        ],
      });
      for (var i = 0; i < 1; i++) {
        cls.name = 'Test' + i;
        cls.methods[0].body = 'return "Hello'+i+'"';
        console.log(cls.toSwiftSource());
      }
      */
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
