foam.CLASS({
  name: 'Test',
  messages: [
    {
      name: 'greeting',
      message: 'Hello there ${first} ${last}',
      description: 'Greeting where ${last} is last name and ${first} is first.',
    }
  ],
  properties: [
    {
      class: 'String',
      name: 'firstName',
      value: 'John',
      swiftPreSet: function() {/*
NSLog("You're about to change your first name to %@", newValue)
return newValue
      */},
    },
    {
      class: 'String',
      name: 'lastName',
      value: 'Smith',
      swiftPostSet: 'NSLog("Thanks for changing your last name %@", newValue)'
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
      swiftCode: 'NSLog(type(of: self).greeting, firstName, lastName)',
      code: function() {}, // To suppress warning.
    },
  ],
  methods: [
    {
      name: 'methodWithAnArgAndReturn',
      swiftReturnType: 'String',
      args: [
        {
          name: 'name',
          swiftType: 'String',
        },
      ],
      swiftCode: function() {/*
return String(format: type(of: self).greeting, name, "LASTNAME")
      */},
    }
  ]
});
