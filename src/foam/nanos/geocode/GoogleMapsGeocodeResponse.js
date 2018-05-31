/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsGeocodeResponse',

  documentation: 'Represents the response from calling Google\'s geocode API',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.geocode.GoogleMapsGeocodeResult',
      name: 'results',
      documentation: 'Array of geocoded address information and geometry information'
    },
    {
      class: 'String',
      name: 'status',
      documentation: 'Contains the status of the request'
    },
    {
      class: 'String',
      name: 'error_message',
      documentation: 'Contains an error message'
    }
  ]
});
