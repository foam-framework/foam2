/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.ruler',
  name: 'AddPasswordHistoryAction',
  documentation: 'Adds an entry into the password history of a user',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.PriorPassword',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.Date'
  ],

  constants: [
    {
      name: 'MAXIMUM_PRIOR_PASSWORDS',
      type: 'Long',
      value: 10
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            PriorPassword[] priorPasswordsOld = user.getPasswordHistory();
            
            // compute how large the new array should be and where it should start copying from
            int newArrayLength = priorPasswordsOld.length + 1;
            int startCopyingIndex = 0;
            int copyLength = priorPasswordsOld.length;
            
            // only store up to the maximum number of password history records
            if ( priorPasswordsOld.length >= MAXIMUM_PRIOR_PASSWORDS ) {
              newArrayLength = (int) MAXIMUM_PRIOR_PASSWORDS;
              startCopyingIndex = (int) (priorPasswordsOld.length - (MAXIMUM_PRIOR_PASSWORDS - 1));
              copyLength = (int) MAXIMUM_PRIOR_PASSWORDS - 1;
            }

            // copy the old array into a new array
            PriorPassword[] priorPasswordNew = new PriorPassword[newArrayLength];
            System.arraycopy(priorPasswordsOld, startCopyingIndex, priorPasswordNew, 0, copyLength);

            // add the new entry to the end of the array
            PriorPassword priorPassword = new PriorPassword();
            priorPassword.setPassword(user.getPassword());
            priorPassword.setTimeStamp(new Date());
            priorPasswordNew[priorPasswordNew.length-1] = priorPassword;
            user.setPasswordHistory(priorPasswordNew);
          }
        }, "Password History Addition");
      `
    }
  ]
});