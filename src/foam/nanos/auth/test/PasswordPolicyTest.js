/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'PasswordPolicyTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.DirectAgency',
    'foam.core.X',
    'foam.nanos.auth.PasswordPolicy',
    'foam.nanos.auth.User',
    'foam.util.Password'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // disabled password policy tests
        PasswordPolicy_Disabled_Test(x, null, "null passwords allowed when disabled.");
        PasswordPolicy_Disabled_Test(x, "short", "short password allowed when disabled.");
        PasswordPolicy_Disabled_Test(x, "F0amframew0rk", "Standard password allowed when disabled.");
      
        // default password policy tests
        PasswordPolicy_Default_Test(x, null, "null passwords not allowed.", false);
        PasswordPolicy_Default_Test(x, "short", "short password not allowed.", false);
        PasswordPolicy_Default_Test(x, "F0amframew0rk", "Standard password allowed.", true);

        // changing the min length
        PasswordPolicy_MinLength_Test(x, 0, "F0amframew0rk", "Min length 0 ignored.", true);
        PasswordPolicy_MinLength_Test(x, 0, "F0am", "Min length 0 ignored, 6 always used.", false);
        PasswordPolicy_MinLength_Test(x, 5, "F0amframew0rk", "Min length less than 6 ignored.", true);
        PasswordPolicy_MinLength_Test(x, 5, "F0amf", "Min length less than 6 ignored. Trying to set to 5.", false);
        PasswordPolicy_MinLength_Test(x, 6, null, "Null passwords not allowed", false);
        PasswordPolicy_MinLength_Test(x, 6, "short", "Short password not allowed", false);
        PasswordPolicy_MinLength_Test(x, 10, "012345678", "Min length changed and password must be longer", false);
        PasswordPolicy_MinLength_Test(x, 6, "F0amframew0rk", "Standard password longer than min length", true);
        PasswordPolicy_MinLength_Test(x, 10, "F0amframew0rk", "Standard password longer than updated min length", true);
        PasswordPolicy_MinLength_Test(x, 14, "F0amframew0rk", "Standard password shorter than updated min length", false);
 
        // check history
        String[] history = new String[] { };
        PasswordPolicy_History_Test(x, 0, "F0amframew0rk", history, "Password history skipped when 0 and empty.", true);
        PasswordPolicy_History_Test(x, 1, "F0amframew0rk", history, "Password history validation passes when 1 and empty.", true);
        PasswordPolicy_History_Test(x, 10, "F0amframew0rk", history, "Password history validation passes when 10 and emtpy.", true);

        history = new String[] { "F0amframew0rk" };
        PasswordPolicy_History_Test(x, 0, "F0amframew0rk", history, "Password history skipped when 0.", true);
        PasswordPolicy_History_Test(x, 1, "F0amframew0rk", history, "Password history catches duplicate in history.", false);
        PasswordPolicy_History_Test(x, 1, "AnotherFramew1rk", history, "Password history does not block password validation.", true);

        history = new String[] { "F0amframew0rk", "001", "002", "003", "004", "005", "006", "007", "008", "009" };
        PasswordPolicy_History_Test(x, 0, "F0amframew0rk", history, "Password history skipped when 0 and long history kept.", true);
        PasswordPolicy_History_Test(x, 9, "F0amframew0rk", history, "Password history checked in order and ninth entry does not fail validation.", true);
        PasswordPolicy_History_Test(x, 10, "F0amframew0rk", history, "Password history catches duplicate last in history", false);
      `
    },
    {
      name: 'PasswordPolicy_Disabled_Test',
      args: [
        { type: 'Context', name: 'x'        },
        { type: 'String',  name: 'password' },
        { type: 'String',  name: 'message'  }
      ],
      javaCode: `
        try {
          // disabled password policy
          PasswordPolicy policy = new PasswordPolicy();
          policy.setEnabled(false);
          policy.setMinLength(6);
          policy.setPriorPasswordsToCheckCount(0);

          // validate should return immediately on a disabled policy
          policy.validate(null, password);
          test(true, message);
        } catch ( Throwable t ) {
          test(false, message + " - " + t.getMessage());
        }
      `
    },
    {
      name: 'PasswordPolicy_Default_Test',
      args: [
        { type: 'Context', name: 'x'        },
        { type: 'String',  name: 'password' },
        { type: 'String',  name: 'message'  },
        { type: 'Boolean', name: 'succeeds' }
      ],
      javaCode: `
        try {
          // default password policy
          PasswordPolicy policy = new PasswordPolicy();
          policy.setEnabled(true);
          policy.setMinLength(6);
          policy.setPriorPasswordsToCheckCount(0);

          // validate
          policy.validate(null, password);
          test(succeeds, succeeds ? message : "PasswordPolicy validation should throw a RuntimeException - " + message);
        } catch ( Throwable t ) {
          if ( ! succeeds ) {
            test(t instanceof RuntimeException, message);
          } else {
            test(false, message + " - " + t.getMessage());
          }
        }
      `
    },
    {
      name: 'PasswordPolicy_History_Test',
      args: [
        { type: 'Context',  name: 'x'            },
        { type: 'Integer',  name: 'historyCount' },
        { type: 'String',   name: 'password'     },
        { type: 'String[]', name: 'history'      },
        { type: 'String',   name: 'message'      },
        { type: 'Boolean',  name: 'succeeds'     }
      ],
      javaCode: `
        try {
          // default password policy
          PasswordPolicy policy = new PasswordPolicy();
          policy.setEnabled(true);
          policy.setMinLength(6);
          policy.setPriorPasswordsToCheckCount(historyCount);

          // setup the user
          User user = new User.Builder(x).setPassword(Password.hash("password")).build();
          for (String historyEntry : history) {
            user.setPassword(Password.hash(historyEntry)); // , Password.decode(Password.getSalt(hash))));
            new foam.nanos.auth.ruler.AddPasswordHistoryAction().applyAction(x, user, null, null, null, new DirectAgency());
          }

          // validate
          policy.validate(user, password);
          test(succeeds, succeeds ? message : "PasswordPolicy validation should throw a RuntimeException - " + message);
        } catch ( Throwable t ) {
          if ( ! succeeds ) {
            test(t instanceof RuntimeException, message);
          } else {
            test(false, message + " - " + t.getMessage());
          }
        }
      `
    },
    {
      name: 'PasswordPolicy_MinLength_Test',
      args: [
        { type: 'Context', name: 'x'         },
        { type: 'Integer', name: 'minLength' },
        { type: 'String',  name: 'password'  },
        { type: 'String',  name: 'message'   },
        { type: 'Boolean', name: 'succeeds'  }
      ],
      javaCode: `
        try {
          // default password policy
          PasswordPolicy policy = new PasswordPolicy();
          policy.setEnabled(true);
          policy.setMinLength(minLength);
          policy.setPriorPasswordsToCheckCount(0);

          // validate
          policy.validate(null, password);
          test(succeeds, succeeds ? message : "PasswordPolicy validation should throw a RuntimeException - " + message);
        } catch ( Throwable t ) {
          if ( ! succeeds ) {
            test(t instanceof RuntimeException, message);
          } else {
            test(false, message + " - " + t.getMessage());
          }
        }
      `
    }
  ]
});
