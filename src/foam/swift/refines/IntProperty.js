/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Int',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      value: 'Int',
    },
    {
      name: 'swiftAdapt',
      factory: function() {
        return function() {/*
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        */}
      },
    },
    {
      name: 'swiftValue',
      expression: function(value) {
        return value + '';
      },
    },
    {
      name: 'swiftView',
      value: 'foam.swift.ui.FOAMUITextFieldInt',
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Long',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftAdapt',
      factory: function() {
        return function() {/*
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        */}
      },
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Float',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      value: 'Float',
    },
    {
      name: 'swiftAdapt',
      factory: function() {
        return function() {/*
var newValue = newValue
if let str = newValue as? String { newValue = Float(str) }
if let i = newValue as? Float { return i }
return 0
        */}
      },
    },
  ],
});
