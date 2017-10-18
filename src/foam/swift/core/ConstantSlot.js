/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.core',
  name: 'ConstantSlot',
  extends: 'foam.swift.core.Slot',
  properties: [
    {
      name: 'value',
    },
  ],
  methods: [
    {
      name: 'swiftGet',
      swiftCode: function() {/*
return value
      */},
    },
  ]
});
