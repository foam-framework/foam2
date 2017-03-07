foam.CLASS({
  package: 'foam.swift.core',
  name: 'ConstantSlot',
  extends: 'foam.swift.core.Slot',
  properties: [
    {
      name: 'value',
    },
  ],
  methods: [
    {
      name: 'swiftGet',
      swiftCode: function() {/*
return value
      */},
    },
  ]
});
