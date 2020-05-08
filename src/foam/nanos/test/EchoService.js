/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.test',
  name: 'EchoService',
  methods: [
    {
      name: 'echo',
      type: 'FObject',
      async: true,
      args: [ { name: 'obj', type: 'FObject' } ]
    }
  ]
});
