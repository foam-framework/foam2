/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
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
      code: function(value) {
        value.lastModified = new Date();
        return SUPER(value);
      },
      javaCode:
`((LastModifiedAware) obj).setLastModified(Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime());
return super.put_(x, obj);`
    }
  ]
});
