foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsGeocodeResult',

  documentation: 'Represents geocoded address information and geometry information',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.geocode.GoogleMapsAddressComponent',
      name: 'address_component',
      documentation: 'Array of geocoded address information'
    },
    {
      class: 'String',
      name: 'formatted_address',
      documentation: 'Formatted address'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsGeometry',
      name: 'geometry'
    },
    {
      class: 'String',
      name: 'place_id',
      documentation: 'Place Id'
    },
    {
      class: 'StringArray',
      name: 'types'
    }
  ]
});
