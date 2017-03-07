foam.CLASS({
  package: 'foam.swift.core',
  name: 'PropertySlot',
  extends: 'foam.swift.core.Slot',
  properties: [
    {
      name: 'object',
      swiftType: 'FObject!',
      swiftWeak: true,
    },
    {
      class: 'String',
      name: 'propertyName',
    },
  ],
  methods: [
    {
      name: 'swiftGet',
      swiftCode: function() {/*
return object.get(key: propertyName)
      */},
    },
    {
      name: 'swiftSet',
      swiftCode: function() {/*
object.set(key: propertyName, value: value)
      */},
    },
    {
      name: 'swiftSub',
      swiftCode: function() {/*
return object.sub(topics: ["propertyChange", propertyName], listener: listener)
      */},
    },
  ]
});
