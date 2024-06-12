/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AddressConfig',

  documentation: 'Base class for storing street address component order',

  ids: ['country'],

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'country',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'Int',
      name: 'streetNumber'
    },
    {
      class: 'Int',
      name: 'streetName'
    },
    {
      class: 'Int',
      name: 'suite'
    }
  ]
});
