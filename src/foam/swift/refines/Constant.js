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
      expression: function(of) {
        return of ? foam.lookup(of).model_.swiftName : 'Any?';
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
        return swiftFactory ? '' : foam.swift.stringify(value);
      }
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
        initializer: this.swiftFactory,
      }));
    },
  ]
});
