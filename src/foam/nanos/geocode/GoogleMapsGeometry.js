foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsGeometry',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsBoundary',
      name: 'bounds'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsCoordinates',
      name: 'location'
    },
    {
      class: 'String',
      name: 'location_type'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsBoundary',
      name: 'viewport'
    }
  ]
});
