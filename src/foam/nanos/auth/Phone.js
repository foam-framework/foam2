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
      label: 'Phone Number',
      validationPredicates: [
        {
          args: ['number'],
          predicateFactory: function(e) {
            return e.REG_EXP(
              foam.nanos.auth.Phone.NUMBER,
              /^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/);
          },
          errorString: 'Please enter phone number'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'verified',
      writePermissionRequired: true,
      readPermissionRequired: true,
      createVisibility: 'HIDDEN',
    }
  ]
});
