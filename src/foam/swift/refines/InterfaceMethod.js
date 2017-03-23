foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  requires: [
    'foam.swift.ProtocolMethod',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'swiftEnabled',
      expression: function(swiftCode) {
        return !!this.swiftCode;
      }
    }
  ],
  methods: [
    function writeToSwiftClass(cls, superAxiom) {
      if ( !this.swiftEnabled ) return;
      cls.method(this.ProtocolMethod.create({
        name: this.swiftName,
        returnType: this.swiftReturnType,
        args: this.swiftArgs,
      }));
    },
  ]
});
