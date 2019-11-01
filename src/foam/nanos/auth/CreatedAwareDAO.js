/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CreatedAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO that sets created property',

  javaImports: [
    'java.util.Calendar',
    'java.util.TimeZone'
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        if ( ! foam.nanos.auth.CreatedAware.isInstance(obj) ) {
          return this.delegate.put_(x, obj);
        }
        return this.delegate.find_(x, obj).then(function(result) {
          if ( result == null ) {
            obj.created = new Date();
          }
          return this.delegate.put_(x, obj);
        }.bind(this));
      },
      javaCode: `
        // only set created if object does not exist in DAO yet
        if ( obj instanceof CreatedAware && getDelegate().find_(x, obj) == null ) {
          ((CreatedAware) obj).setCreated(Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime());
        }
        return super.put_(x, obj);
      `
    }
  ]
});
