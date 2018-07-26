/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Argument',
  flags: ['swift'],
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
      name: 'swiftDefaultValue',
    },
    {
      class: 'StringArray',
      name: 'swiftAnnotations',
    },
    {
      class: 'String',
      name: 'swiftType',
      expression: function(of, optional) {
        of = foam.String.isInstance(of) ? foam.lookup(of, true) : of;
        return of ? of.model_.swiftName + (optional ? '?' : '') : 'Any?';
      },
    },
  ],
  methods: [
    function toSwiftArg() {
      var arg = this.Argument.create({
        localName: this.swiftLocalName,
        externalName: this.swiftExternalName,
        type: this.swiftType,
        annotations: this.swiftAnnotations,
      });
      if (this.swiftDefaultValue) arg.defaultValue = this.swiftDefaultValue;
      return arg;
    },
  ]
});
