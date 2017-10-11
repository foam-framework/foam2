/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'EnabledAware',

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    }
  ]
});

// TODO: create an EnabledAwareDAO
