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
      code: function(x, obj) {
        if ( ! foam.nanos.auth.CreatedByAware.isInstance(obj) ) {
          return this.delegate.put_(x, obj);
        }
        return this.delegate.find_(x, obj).then(function(result) {
          if ( result == null ) {
            obj.createdBy = x.user.id;
          }
          return this.delegate.put_(x, obj);
        }.bind(this));
      },
      javaCode: `
        // only set created by if object does not exist in DAO yet
        if ( obj instanceof CreatedByAware && getDelegate().find_(x, obj) == null ) {
          User user = (User) x.get("user");
          ((CreatedByAware) obj).setCreatedBy(user.getId());
        }
        return super.put_(x, obj);
      `
    }
  ]
});
