/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsCoordinates',

  documentation: 'Represents latitude and longitude coordinates',

  properties: [
    {
      class: 'Double',
      name: 'lat',
      documentation: 'Latitude'
    },
    {
      class: 'Double',
      name: 'lng',
      documentation: 'Longitude'
    }
  ]
});
