/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'RequiredClass',
  package: 'somepackage',
  imports: [
    'firstName',
  ],
  actions: [
    {
      name: 'sayHi',
      code: function() {},
      swiftCode: 'NSLog("HELLO %@", firstName as? String ?? "FAILED")',
    },
  ],
});
