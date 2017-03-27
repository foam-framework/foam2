/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'FOAMUITextField',
  swiftImports: [
    'UIKit',
  ],
  swiftImplements: ['UITextFieldDelegate'],
  properties: [
    {
      name: 'view',
      swiftType: 'UITextField',
      swiftFactory: 'return UITextField()',
      swiftPostSet: function() {/*
let updateTextField: Listener = { [weak self] _ in
  if self == nil { return }
  newValue.text = self!.data == nil ?
      self!.emptyValue : String(describing: self!.data!)
}
viewSub?.detach()
viewSub = data$.swiftSub(updateTextField)
updateTextField(viewSub!, [])
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
      swiftReturnType: 'Bool',
      swiftCode: function() {/*
textField.resignFirstResponder()
return true
      */},
    },
  ],
});
