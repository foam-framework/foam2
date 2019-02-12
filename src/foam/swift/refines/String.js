/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'StringSwiftRefinement',
  refines: 'foam.core.String',
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
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        `
      },
    },
    {
      name: 'swiftView',
      value: 'foam.swift.ui.FOAMUITextField',
    },
  ],
});
