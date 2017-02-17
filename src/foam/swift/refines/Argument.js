foam.CLASS({
  refines: 'foam.core.Argument',
  requires: [
    'foam.swift.Argument',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftLocalName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftExternalName',
      value: '_',
    },
    {
      class: 'String',
      name: 'swiftType',
    },
  ],
  methods: [
    function toSwiftArg() {
      return this.Argument.create({
        localName: this.swiftLocalName,
        externalName: this.swiftExternalName,
        type: this.swiftType,
      });
    },
  ]
});
