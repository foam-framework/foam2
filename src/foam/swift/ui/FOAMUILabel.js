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
      swiftPostSet: function() {/*
updateLabel();
      */},
    },
    {
      name: 'data',
      swiftPostSet: function() {/*
updateLabel();
      */},
    },
  ],
  listeners: [
    {
      isMerged: true,
      name: 'updateLabel',
      swiftCode: function() {/*
view.text = data == nil ? "nil" : String(describing: data!)
      */},
    },
  ],
});
