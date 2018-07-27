/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
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
      class: 'String',
      name: 'swiftType',
      value: 'Any?',
    },
    {
      class: 'String',
      name: 'swiftValue',
      // TODO adapt the value to swift safe value.
      value: 'nil',
    },
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      cls.fields.push(this.Field.create({
        name: this.name,
        type: this.swiftType,
        static: true,
        final: true,
        defaultValue: this.swiftValue,
      }));
    },
  ]
});
