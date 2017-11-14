/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsBoundary',

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