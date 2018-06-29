/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CreatedByAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO that sets createdBy property',

  methods: [
    {
      name: 'put_',
      javaCode: `
        Object id = obj.getProperty("id");
        // only set created by if object does not exist in DAO yet
        if ( obj instanceof CreatedByAware && getDelegate().find(id) == null ) {
          User user = (User) x.get("user");
          ((CreatedByAware) obj).setCreatedBy(user.getId());
        }
        return super.put_(x, obj);
      `
    }
  ]
});
