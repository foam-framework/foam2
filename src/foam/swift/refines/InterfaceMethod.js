/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  requires: [
    'foam.swift.ProtocolMethod',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'swiftSupport',
      value: true,
    }
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if ( !this.swiftSupport ) return;
      cls.method(this.ProtocolMethod.create({
        name: this.swiftName,
        returnType: this.swiftReturns,
        args: this.swiftArgs,
        throws: this.swiftThrows,
      }));
    },
  ]
});
