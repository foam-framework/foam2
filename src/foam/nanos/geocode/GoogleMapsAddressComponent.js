foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsAddressComponent',

  properties: [
    {
      class: 'String',
      name: 'long_name'
    },
    {
      class: 'String',
      name: 'short_name'
    },
    {
      class: 'StringArray',
      name: 'types'
    }
  ]
});
