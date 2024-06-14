/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC.search',
  name: 'Search',

  properties: [
    {
      class: 'String',
      name: 'query',
      label: 'search M',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true
      }
    }
  ]
});
