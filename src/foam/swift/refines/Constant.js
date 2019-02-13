/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'ConstantSwiftRefinement',
  refines: 'foam.core.Constant',
  flags: ['swift'],
  requires: [
    'foam.swift.Field',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name },
    },
    {
      class: 'foam.swift.SwiftTypeProperty',
      expression: function(type) {
        var swiftType = foam.swift.toSwiftType(type);
        if ( foam.swift.isNullable(swiftType) ) {
          // A nullable constant isn't useful so don't let them be nullable.
          swiftType = swiftType.slice(0, -1)
        }
        return swiftType
      },
    },
    {
      class: 'String',
      name: 'swiftFactory',
    },
    {
      class: 'String',
      name: 'swiftValue',
      expression: function(value, swiftFactory) {
        return swiftFactory ? '' : foam.swift.asSwiftValue(value);
      }
    },
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;

      // If the swift value is nil then this Constant probably isn't implemented
      // by swift so ignore it.
      if ( this.swiftValue == 'nil' ) return;

      cls.fields.push(this.Field.create({
        name: this.name,
        type: this.swiftType,
        static: true,
        final: true,
        defaultValue: this.swiftValue,
        initializer: this.swiftFactory,
      }));
    },
  ]
});
