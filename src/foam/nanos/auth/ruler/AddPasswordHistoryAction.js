/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.ruler',
  name: 'AddPasswordHistoryAction',
  documentation: 'Adds an entry into the status history of a transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.HistoricPassword',
    'foam.nanos.auth.User',
    'java.util.Date'
  ],

  constants: [
    {
      name: 'MAXIMUM_HISTORIC_PASSWORDS',
      type: 'Long',
      value: 10
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        HistoricPassword[] historicPasswordsOld = user.getPasswordHistory();
        
        // compute how large the new array should be and where it should start copying from
        int newArrayLength = historicPasswordsOld.length + 1;
        int startCopyingIndex = 0;
        int copyLength = historicPasswordsOld.length;
        
        // only store up to the maximum number of password history records
        if (historicPasswordsOld.length >= MAXIMUM_HISTORIC_PASSWORDS) {
          newArrayLength = (int) MAXIMUM_HISTORIC_PASSWORDS;
          startCopyingIndex = 1;
          copyLength = (int) MAXIMUM_HISTORIC_PASSWORDS - 1;
        }

        // copy the old array into a new array
        HistoricPassword[] historicPasswordNew = new HistoricPassword[newArrayLength];
        System.arraycopy(historicPasswordsOld, startCopyingIndex, historicPasswordNew, 0, copyLength);

        // add the new entry to the end of the array
        HistoricPassword historicPassword = new HistoricPassword();
        historicPassword.setPassword(user.getPassword());
        historicPassword.setTimeStamp(new Date());
        historicPasswordNew[historicPasswordNew.length-1] = historicPassword;
        user.setPasswordHistory(historicPasswordNew);
      `
    }
  ]
});