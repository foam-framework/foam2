/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.String',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      value: 'String',
    },
    {
      name: 'swiftAdapt',
      factory: function() { 
        return foam.String.multiline(function() {/*
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        */});
      },
    },
    {
      name: 'swiftView',
      value: 'foam.swift.ui.FOAMUITextField',
    },
    {
      name: 'swiftValue',
      expression: function(value) { return foam.swift.stringify(value) },
    },
  ],
});
