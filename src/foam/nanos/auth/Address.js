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
      class: 'Int',
      name: 'buildingNumber',
      documentation: 'Building number'
    },
    {
      class: 'String',
      name: 'address',
      required: true
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
    }
  ]
});
