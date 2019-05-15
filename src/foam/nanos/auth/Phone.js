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
      type: 'Regex',
      value: /([+]?\d{1,2}[\.\-\s]?)?(\d{3}[.-]?){2}\d{4}/g
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'PhoneNumber',
      name: 'number',
      required: true,
      validateObj: function (number) {
        if ( ! this.PHONE_REGEX.test(number) ) {
          return this.INVALID_NUMBER;
        }
      },
      preSet: function(o, n) {
        return n.replace(/[- )(]/g, '');
      },
      javaValidateObj: `
        String number = ((Phone) obj).getNumber();
        if ( ! Phone.PHONE_REGEX.matcher(number).matches() ) {
          throw new IllegalStateException(Phone.INVALID_NUMBER);
        }
      `
    }
  ]
});
