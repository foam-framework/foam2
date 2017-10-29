/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'FOAMUILabel',
  swiftImports: [
    'UIKit',
  ],
  properties: [
    {
      name: 'view',
      swiftType: 'UILabel',
      swiftFactory: 'return UILabel()',
    },
    {
      name: 'data',
      swiftPostSet: function() {/*
self.view.text = newValue == nil ? "nil" : String(describing: newValue!)
      */},
    },
  ],
});
