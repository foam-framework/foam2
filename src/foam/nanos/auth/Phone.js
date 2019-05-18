/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Phone',

  documentation: 'Phone number information.',

  messages: [
    {
      name: 'INVALID_NUMBER',
      message: 'Invalid phone number.'
    }
  ],

  constants: [
    {
      name: 'PHONE_REGEX',
      factory: function() {
        return /^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/
      }
    }
  ],

  properties: [
    {
      class: 'PhoneNumber',
      name: 'number',
      label: '',
      required: true,
      validateObj: function (number) {
        if ( ! this.PHONE_REGEX.test(number) ) {
          return this.INVALID_NUMBER;
        }
      },
      javaValidateObj: `
        String number = ((Phone) obj).getNumber();
        if ( foam.util.SafetyUtil.isEmpty(number) ) {
          throw new IllegalStateException(Phone.INVALID_NUMBER);
        }
      `
    },
    {
      class: 'Boolean',
      name: 'verified',
      permissionRequired: true
    }
  ]
});
