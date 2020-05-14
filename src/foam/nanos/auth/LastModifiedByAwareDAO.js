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
        if ( ! foam.nanos.auth.LastModifiedByAware.isInstance(obj) ) {
          return this.delegate.put_(x, obj);
        }
        return this.delegate.find_(x, obj).then(function(old) {
          if ( ! obj.equals(old) ) {
            obj.lastModifiedBy = x.user.id;
          }
          return this.delegate.put_(x, obj);
        }.bind(this));
      },
      javaCode: `
        if ( obj instanceof LastModifiedByAware && ! obj.equals(getDelegate().find_(x, obj)) ) {
          User user = ((Subject) x.get("subject")).getRealUser();
          ((LastModifiedByAware) obj).setLastModifiedBy(user.getId());
        }
        return super.put_(x, obj);
      `
    }
  ]
});
