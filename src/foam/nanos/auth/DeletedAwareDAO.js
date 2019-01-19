/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'DeletedAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO that sets deleted property',

  methods: [
    {
      name: 'remove_',
      javaCode: `
        if ( obj instanceof DeletedAware ) {
          obj = obj.fclone();
          ((DeletedAware) obj).setDeleted(true);
          return super.put_(x, obj);
        }
        return super.remove_(x, obj);
      `
    }
  ],
});
