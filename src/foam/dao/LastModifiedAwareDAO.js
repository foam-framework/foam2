/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'LastModifiedAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put',
      code: function(value) {
        value.lastModified = new Date();
        SUPER.put(value);
      }
    }
  ]
});
