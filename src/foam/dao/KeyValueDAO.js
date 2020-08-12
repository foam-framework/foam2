/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'KeyValueDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'DAO that only responds to put/find',

  javaImports: [
    'foam.nanos.fs.File'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO fileDAO = (DAO) x.get("fileDAO");
        // Return the same object if it is update operation
        if ( fileDAO.find( ((File) obj).getId()) != null ) {
          return obj;
        }
        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      code: function(obj) {
        return Promise.resolve(obj);
      },
      javaCode: 'return obj;'
    },
    {
      name: 'select_',
      code: function(sink) {
        return Promise.resolve(sink);
      },
      javaCode: 'return sink;'
    },
    {
      name: 'removeAll_',
      code: function() {
        return Promise.resolve();
      },
      javaCode: '//noop'
    }
  ]
});
