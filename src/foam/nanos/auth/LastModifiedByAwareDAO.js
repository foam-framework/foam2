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
      code: function(x, obj) {
        if ( foam.nanos.auth.LastModifiedByAware.isInstance(obj) ) {
          obj.lastModifiedBy = x.user.id;
        }
        return this.SUPER(x, obj);
      },
      javaCode: `
        if ( obj instanceof LastModifiedByAware ) {
          User user = (User) x.get("user");
          User agent = (User) x.get("agent");
          ((LastModifiedByAware) obj).setLastModifiedBy(agent != null ? agent.getId() : user.getId());
        }
        return super.put_(x, obj);
      `
    }
  ]
});
