/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsGeocodeResult',

  documentation: 'Represents geocoded address information and geometry information',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.geocode.GoogleMapsAddressComponent',
      name: 'address_components',
      documentation: 'Array of geocoded address information'
    },
    {
      class: 'String',
      name: 'formatted_address',
      documentation: 'String containing the human-readable address of this location'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.geocode.GoogleMapsGeometry',
      name: 'geometry',
      documentation: 'Address geometry information'
    },
    {
      class: 'String',
      name: 'place_id',
      documentation: 'Unique identifier that can be used with other Google APIs'
    },
    {
      class: 'StringArray',
      name: 'types',
      documentation: 'Indicates the type of the returned result'
    }
  ]
});
