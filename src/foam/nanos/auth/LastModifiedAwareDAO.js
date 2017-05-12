/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: Test
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put',
      code: function(value) {
        value.lastModified = new Date().now();
        super.put(value);
      }
    }
  ]
});
