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

  javaImports: [
    'foam.core.FObject',
    'foam.dao.RemoveSink',
    'foam.nanos.auth.AuthService',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        return read(x, super.find_(x, id));
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          super.select_(x, new DeletedAwareSink(x, sink, this), skip, limit, order, predicate);
          return sink;
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
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
    },
    {
      name: 'removeAll_',
      javaCode: `
        getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
      `
    },
    {
      name: 'read',
      javaReturns: 'FObject',
      args: [
        { of: 'foam.core.X', name: 'x' },
        { of: 'FObject', name: 'obj' }
      ],
      javaCode: `
        if ( obj != null
          && obj instanceof DeletedAware
          && ((DeletedAware) obj).getDeleted()
        ) {
          String of = obj.getClass().getSimpleName().toLowerCase();
          AuthService auth = (AuthService) x.get("auth");

          if ( ! auth.check(x, of + ".read.deleted") ) {
            return null;
          }
        }
        return obj;
      `
    }
  ],
});

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'DeletedAwareSink',
  extends: 'foam.dao.ProxySink',

  javaImports: [
    'foam.core.FObject',
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        FObject result = dao.read(getX(), (FObject) obj);
        if ( result != null ) {
          super.put(result, sub);
        }
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private DeletedAwareDAO dao;
          public DeletedAwareSink(foam.core.X  x, foam.dao.Sink delegate, DeletedAwareDAO dao) {
            setX(x);
            setDelegate(delegate);
            this.dao = dao;
          }
        `);
      }
    }
  ]
});
