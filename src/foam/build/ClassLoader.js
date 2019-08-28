/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.build',
  name: 'ClassLoader',
  methods: [
    {
      name: 'load',
      async: true,
      type: 'Class',
      args: [ { class: 'String', name: 'id' } ]
    }
  ]
});
