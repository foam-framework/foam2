foam.CLASS({
  refines: 'foam.core.Model',
  requires: [
    'foam.swift.SwiftClass',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
  ],
  methods: [
    function toSwiftClass() {
      var cls = this.SwiftClass.create({
        name: this.swiftName,
      });
      for (var i = 0, axiom; axiom = this.axioms_[i]; i++) {
        if ( axiom.writeToSwiftClass ) axiom.writeToSwiftClass(cls);
      }
      return cls;
    },
  ]
});
