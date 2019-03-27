/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'IntSwiftRefinement',
  refines: 'foam.core.Int',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftOptional',
      value: false,
    },
    {
      name: 'swiftAdapt',
      factory: function() {
        return `
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        `
      },
    },
    {
      name: 'swiftView',
      value: 'foam.swift.ui.FOAMUITextFieldInt',
    },
  ],
});

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'ShortSwiftRefinement',
  refines: 'foam.core.Short',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftAdapt',
      factory: function() {
        return `
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int16.max)
  let min = Int(Int16.min)
  return Int16(i > max ? max : i < min ? min : i)
}
return 0
        `;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'LongSwiftRefinement',
  refines: 'foam.core.Long',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftAdapt',
      factory: function() {
        return `
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        `
      },
    },
  ],
});

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'FloatSwiftRefinement',
  refines: 'foam.core.Float',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftAdapt',
      factory: function() {
        return `
var newValue = newValue
if let str = newValue as? String { newValue = ${this.swiftType}(str) }
if let i = newValue as? ${this.swiftType} { return i }
return 0
        `
      },
    },
  ],
});
