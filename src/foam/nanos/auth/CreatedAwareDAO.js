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
        if ( ! obj.id ) {
          obj.created = new Date();
        }
        return this.SUPER(x, obj);
      },
      javaCode: `
        Object id = obj.getProperty("id");
        // only set created if object does not exist in DAO yet
        if ( obj instanceof CreatedAware && getDelegate().find_(x, id) == null ) {
          ((CreatedAware) obj).setCreated(Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime());
        }
        return super.put_(x, obj);
      `
    }
  ]
});
