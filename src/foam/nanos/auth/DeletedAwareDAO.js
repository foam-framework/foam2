/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'DeletedAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that sets deleted property when an object
    is removing and filters out deleted=true objects based on permission.

    DeletedAwareDAO marks object as deleted instead of actually removing
    the object from DAO then returns thus it should be placed at the end
    of the decorator stack before MDAO so that it wouldn't cut-off other
    decorators that also override "remove_" and "removeAll_".

    For filtering, objects with deleted=true will be filtered out unless
    the user group has {model}.read.deleted permission where {model} is
    the lowercase name of the model of the objects.`,

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
