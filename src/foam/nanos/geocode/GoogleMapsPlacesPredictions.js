/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsPlacesPredictions',

  documentation: 'Address string formulated by Google Places API.',

  properties: [
    {
      class: 'String',
      name: 'description',
      documentation: 'Full address returned by Google Places API.'
    },
    {
      class: 'String',
      name: 'place_id',
      documentation: 'Google maps place id used to lookup additional information of a location.'
    }
  ]
});
