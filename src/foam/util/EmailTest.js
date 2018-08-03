/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'EmailTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        test(! Email.isValid(null), "null email returns false");
        test(! Email.isValid(""), "empty string email returns false");
        test(! Email.isValid("kjc93ubef203e"), "garbage data returns false");
        test(Email.isValid("kirk@nanopay.net"), "valid email returns true");
      `
    }
  ]
});
