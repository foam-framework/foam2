/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.apploader',
  name: 'SubClassLoader',
  exports: ['as classloader'],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.apploader.ClassLoader',
      name: 'delegate',
    },
    {
      name: 'path',
      value: [],
    },
  ],
  methods: [
    function maybeLoad(id) {
      return this.delegate.maybeLoad_(id, this.path);
    },
  ],
});
