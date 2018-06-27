/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'FOAMActionUIButton',
  swiftImports: [
    'UIKit',
  ],
  properties: [
    {
      name: 'view',
      swiftType: 'UIButton',
      swiftFactory: 'return UIButton()',
      swiftPostSet: function() {/*
newValue.addTarget(self, action: #selector(onButtonClick), for: .touchUpInside)
newValue.setTitle(self.action?.label, for: .normal)
      */},
    },
    {
      class: 'FObjectProperty',
      required: false,
      name: 'fobj',
    },
    {
      swiftType: 'ActionInfo?',
      name: 'action',
    },
    {
      class: 'Boolean',
      name: 'dismissKeyboardOnTap',
      value: true,
    },
  ],
  methods: [
    {
      name: 'onButtonClick',
      swiftCode: function() {/*
if dismissKeyboardOnTap {
  UIApplication.shared.keyWindow?.rootViewController?.view.endEditing(true)
}
if fobj != nil { _ = try? action?.call(fobj!) }
      */},
      swiftAnnotations: ['@objc'],
    },
  ],
});
