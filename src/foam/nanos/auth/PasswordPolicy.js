/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PasswordPolicy',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  documentation: 'A Password Policy for a Group.',

  constants: [
    {
      name: 'MIN_PASSWORD_LENGTH',
      type: 'Long',
      value: 6
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled'
    },
    {
      class: 'Long',
      name: 'minLength',
      documentation: 'Minimum length of the password.',
      min: 6,
      factory: function() {
        return MIN_PASSWORD_LENGTH;
      },
      javaFactory: `
        return MIN_PASSWORD_LENGTH;
      `
    },
    {
      class: 'Long',
      name: 'preventHistoricPasswordCount',
      min: 0,
      max: 10,
      documentation: `
        User passwords are hashed and the hash is kept for historical record up to a maximum of 10 previous entries per user. 
        Setting preventHistoricalPasswordCount to a value greater than zero will enable a check on that many previous password entries
        when resetting the users passwords to prevent them from using the same password again.
        `
    },
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  methods: [
    {
      name: 'validate',
      async: true,
      args: [
        {
          name: 'user',
          type: 'User'
        },
        {
          name: 'potentialPassword',
          javaType: 'String'
        }
      ],
      javaCode: `
        // check if this policy is enabled
        if ( ! this.getEnabled() ) {
          return; // password is valid by default
        }

        // check minimum length
        int minLength = (int) Math.max(this.getMinLength(), MIN_PASSWORD_LENGTH);
        String minLengthRegex = "^.{" + minLength + ",}$";
        if ( SafetyUtil.isEmpty(potentialPassword) || ! (Pattern.compile(minLengthRegex)).matcher(potentialPassword).matches() ) {
          throw new RuntimeException("Password must be at least " + minLength + " characters long.");
        }

        // check password history
        if ( this.getPreventHistoricPasswordCount() > 0 && user != null ) {
          PriorPassword[] priorPasswords = user.getPasswordHistory();
          int maxCount = Math.min((int) this.getPreventHistoricPasswordCount(), priorPasswords.length);
          for ( int i = 0; i < maxCount; i++ ) {
            if ( Password.verify(potentialPassword, priorPasswords[priorPasswords.length - (1 + i) ].getPassword()) ) {
              throw new RuntimeException("Password must be different from previous " + this.getPreventHistoricPasswordCount() + " passwords");
            }
          }
        }

        return;
      `
    }
  ]
});
