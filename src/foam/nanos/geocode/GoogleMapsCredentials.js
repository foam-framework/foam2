/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsCredentials',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'apiKey'
    }
  ]
});
