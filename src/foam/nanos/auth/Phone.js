/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Phone',

  documentation: 'Phone number information.',

  properties: [
    {
      class: 'PhoneNumber',
      name: 'number',
      label: '',
      validationPredicates: [
        {
          args: ['number'],
          predicate: {
            class: 'foam.mlang.predicate.RegExp',
            arg1: {
              class: 'foam.mlang.FObjectPropertyExpr',
              property: 'number'
            },
            regExp: /^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/
          },
          errorString: 'Invalid phone number.'
        }
      ],
      // TODO: Remove javaValidateObj
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
