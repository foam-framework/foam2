/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'PasswordTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // hashing tests
        Password_HashWithInvalidInput_IllegalArgumentException(null, "Password hashing with null throws an IllegalArgumentException");;
        Password_HashWithInvalidInput_IllegalArgumentException("", "Password hashing with empty string input throws an IllegalArgumentException");
        Password_HashWithValidInput_Succeeds("Testing123");

        // isValid tests
        Password_IsValid(null, false, "isValid method returns false given null");
        Password_IsValid("", false, "isValid method returns false given empty string");
        Password_IsValid("foam", false, "isValid returns false given password shorter than 8 characters");
        Password_IsValid("foamframework", false, "isValid returns false given password with no uppercase and no numbers");
        Password_IsValid("Foamframework", false, "isValid returns false given password with no numbers");
        Password_IsValid("F0amframew0rk", true, "isValid returns true given password longer than 8 characters, with uppercase and with numbers");
      `
    },
    {
      name: 'Password_HashWithInvalidInput_IllegalArgumentException',
      args: [
        { class: 'String', name: 'input'    },
        { class: 'String', name: 'message'  }
      ],
      javaCode: `
        try {
          Password.hash(input);
          test(false, "Password hashing with null should throw an IllegalArgumentException");
        } catch ( Throwable t ) {
          test(t instanceof IllegalArgumentException, message);
        }
      `
    },
    {
      name: 'Password_HashWithValidInput_Succeeds',
      args: [
        { class: 'String', name: 'input' }
      ],
      javaCode: `
        try {
          test(! SafetyUtil.isEmpty(Password.hash(input)), "Password hashing with non empty string produces output");
        } catch ( Throwable t ) {
          test(false, "Password hashing with valid input should not throw an exception");
        }
      `
    },
    {
      name: 'Password_IsValid',
      args: [
        { class: 'String',  name: 'input'    },
        { class: 'Boolean', name: 'expected' },
        { class: 'String',  name: 'message'  },
      ],
      javaCode: `
        test(Password.isValid(input) == expected, message);
      `
    }
  ]
});
