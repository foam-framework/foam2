foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsViewport',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsCoordinates',
      name: 'northeast'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsCoordinates',
      name: 'southwest'
    }
  ]
});