foam.CLASS({
  refines: 'foam.core.Property',
  requires: [
    'foam.swift.Field',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftType',
      value: 'Any?',
    },
    {
      class: 'String',
      name: 'swiftFactory'
    },
    {
      class: 'String',
      name: 'swiftValue',
      expression: function(value) {
        return foam.typeOf(value) === foam.String ? '"' + value + '"' :
          foam.typeOf(value) === foam.Undefined ? 'nil' :
          value;
      }
    }
  ],
  methods: [
    function writeToSwiftClass(cls) {
      cls.fields.push(this.Field.create({
        name: this.swiftName,
        type: this.swiftType,
        defaultValue: this.swiftValue,
        initializer: this.swiftFactory,
      }));
    },
  ]
});

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
      })
      for (var i = 0, axiom; axiom = this.axioms_[i]; i++) {
        if ( axiom.writeToSwiftClass ) axiom.writeToSwiftClass(cls);
      }
      return cls;
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.Property',
  requires: [
    'foam.swift.Field',
  ],
  properties: [
    {
      name: 'swiftType',
      value: 'String',
    },
  ],
});
