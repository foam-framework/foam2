/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RetryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO which will retry on exceptions and timeouts',

  properties: [
    {
      name: 'retryStrategy',
      class: 'FObjectProperty',
      of: 'foam.dao.RetryStrategy',
      javaFactory: 'return new foam.dao.DefaultRetryStrategy();'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      return (foam.core.FObject) getRetryStrategy().retry(x, getDelegate(), "put", obj);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      return getRetryStrategy().retry(x, getDelegate(), "cmd", obj);
      `
    }
  ]
});
