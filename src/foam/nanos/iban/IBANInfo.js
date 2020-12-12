/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.iban',
  name: 'IBANInfo',

  javaImports: [
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country'
    },
    {
      class: 'String',
      name: 'bankCode',
      documentation: `BIC`
    },
    {
      class: 'String',
      name: 'branch',
    },
    {
      class: 'String',
      name: 'accountNumber',
    },
    {
      class: 'String',
      name: 'accountType',
    },
    {
      class: 'String',
      name: 'ownerAccountNumber',
    },
  ]

});
