/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsAddressComponent',

  documentation: 'Component of an address (i.e. street number, or country)',

  properties: [
    {
      class: 'String',
      name: 'long_name',
      documentation: 'Full text description or name of the address component as returned by the Geocoder'
    },
    {
      class: 'String',
      name: 'short_name',
      documentation: 'An abbreviated textual name for the address component, if available'
    },
    {
      class: 'StringArray',
      name: 'types',
      documentation: 'An array indicating the type of the address component'
    }
  ]
});
