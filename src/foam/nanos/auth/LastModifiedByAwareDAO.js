/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( obj instanceof LastModifiedByAware ) {
          User user = (User) x.get("user");
          ((LastModifiedByAware) obj).setLastModifiedBy(user.getId());
        }
        return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        if ( obj instanceof LastModifiedByAware ) {
          User user = (User) x.get("user");
          ((LastModifiedByAware) obj).setLastModifiedBy(user.getId());
        }
        return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        getDelegate().select_(x, new foam.dao.RemoveSink(x, this), skip, limit, order, predicate);
      `
    }
  ]
});
