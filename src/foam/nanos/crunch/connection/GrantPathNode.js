/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'GrantPathNode',

  properties: [
    {
      name: 'capability',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.Capability'
    },
    {
      name: 'ucj',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.UserCapabilityJunction'
    },
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'foam.core.FObject'
    }
  ]
});