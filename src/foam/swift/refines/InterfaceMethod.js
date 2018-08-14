/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  flags: ['swift'],
  requires: [
    'foam.swift.ProtocolMethod',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'swiftSupport',
      value: true,
    },
    {
      class: 'String',
      name: 'swiftCode',
      value: 'fatalError()',
    }
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      if ( ! this.swiftSupport ) return;
      cls.method(this.ProtocolMethod.create({
        name: this.swiftName,
        returnType: this.swiftReturns,
        args: this.swiftArgs,
        throws: this.swiftThrows,
      }));
    },
  ]
});
