/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsAddressComponent',

  properties: [
    {
      class: 'String',
      name: 'long_name'
    },
    {
      class: 'String',
      name: 'short_name'
    },
    {
      class: 'StringArray',
      name: 'types'
    }
  ]
});
