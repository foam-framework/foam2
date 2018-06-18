/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'FOAMUITextField',
  swiftImports: [
    'UIKit',
  ],
  swiftImplements: ['UITextFieldDelegate'],
  implements: ['foam.swift.ui.PropertyView'],
  properties: [
    {
      name: 'view',
      swiftType: 'UITextField',
      swiftFactory: 'return UITextField()',
      swiftPostSet: function() {/*
let updateTextField: Listener = { [weak self] _, _ in
  if self == nil { return }
  newValue.text = self!.data == nil ?
      self!.emptyValue : String(describing: self!.data!)
}
viewSub?.detach()
viewSub = data$.swiftSub(updateTextField)
updateTextField(viewSub!, [])
newValue.delegate = self
      */},
    },
    {
      swiftType: 'Subscription?',
      name: 'viewSub',
    },
    {
      name: 'data',
    },
    {
      class: 'String',
      name: 'emptyValue',
    },
  ],
  methods: [
    {
      name: 'fromProperty',
      swiftCode: function() {/*
view.isEnabled = prop.visibility == Visibility.RW
if view.isEnabled {
  view.backgroundColor = UIColor(red: 0.97, green: 0.97, blue: 0.97, alpha: 1)
}
      */},
    },
    {
      name: 'textFieldDidEndEditing',
      args: [
        {
          name: 'textField',
          swiftType: 'UITextField',
        },
      ],
      swiftCode: function() {/*
data = textField.text ?? ""
      */},
    },
    {
      name: 'textFieldShouldReturn',
      args: [
        {
          name: 'textField',
          swiftType: 'UITextField',
        },
      ],
      swiftReturns: 'Bool',
      swiftCode: function() {/*
textField.resignFirstResponder()
return true
      */},
    },
  ],
});
