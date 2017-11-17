/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Address',

  documentation: 'Postal address.',

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'Boolean',
      name: 'deleted'
    },
    {
      class: 'Boolean',
      name: 'structure',
      value: true
    },
    {
      class: 'Int',
      name: 'buildingNumber',
      documentation: 'Building number'
    },
    /*{
      class: 'String',
      name: 'address',
      required: true
    },*/
    {
      class: 'Int',
      name: 'streetNumber',
    },
    {
      class: 'String',
      name: 'streetName',
    },
    {
      class: 'String',
      name: 'address',
    },
    {
      class: 'String',
      name: 'address2',
    },
    {
      class: 'String',
      name: 'suite'
    },
    {
      class: 'String',
      name: 'city',
      required: true
    },
    {
      class: 'String',
      name: 'postalCode',
      required: true
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      of: 'foam.nanos.auth.Region'
    },
    {
      class: 'Boolean',
      name: 'encrypted'
    },
    {
      class: 'Double',
      name: 'latitude'
    },
    {
      class: 'Double',
      name: 'longitude'
    }
  ]
});
