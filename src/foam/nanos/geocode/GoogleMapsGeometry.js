/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsGeometry',

  documentation: 'Address geometry information',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsBoundary',
      name: 'bounds',
      documentation: 'Stores the bounding box which can fully contain the returned result'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsCoordinates',
      name: 'location',
      documentation: 'Contains geocoded latitude, longitude value'
    },
    {
      class: 'String',
      name: 'location_type',
      documentation: 'Stores additional data about the specified location'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsBoundary',
      name: 'viewport',
      documentation: 'Recommended viewport for displaying the returned result'
    }
  ]
});
