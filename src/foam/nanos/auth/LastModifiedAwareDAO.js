/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Sets lastModified timestamp on put() of LastModifiedAware objects.',

  javaImports: [
    'foam.nanos.auth.LastModifiedAware',
    'java.util.Calendar',
    'java.util.TimeZone'
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        if ( ! foam.nanos.auth.LastModifiedAware.isInstance(obj) ) {
          return this.delegate.put_(x, obj);
        }
        return this.delegate.find_(x, obj).then(function(old) {
          if ( ! obj.equals(old) ) {
            obj.lastModified = new Date();
          }
          return this.delegate.put_(x, obj);
        }.bind(this));
      },
      javaCode: `
        if ( obj instanceof LastModifiedAware && ! obj.equals(getDelegate().find_(x, obj)) ) {
          ((LastModifiedAware) obj).setLastModified(Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime());
        }
        return super.put_(x, obj);
      `
    }
  ]
});
