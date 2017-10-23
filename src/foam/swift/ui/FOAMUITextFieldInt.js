/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'FOAMUITextFieldInt',
  extends: 'foam.swift.ui.FOAMUITextField',
  properties: [
    {
      name: 'view',
      swiftFactory: function() {/*
let t = UITextField() 
t.keyboardType = .numberPad
return t
      */},
    },
    {
      name: 'emptyValue',
      value: "0",
    },
  ],
});
