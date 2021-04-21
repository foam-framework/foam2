/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AddressConfig',

  ids: ['countryId'],

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'String',
      name: 'streetNumber'
    },
    {
      class: 'String',
      name: 'streetName'
    },
    {
      class: 'String',
      name: 'suite'
    }
  ]
});
