/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'DeletedAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.*',
    'foam.mlang.MLang',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.util.SafetyUtil'
  ],

  documentation: `
    DAO decorator that sets deleted property when an object is being removed and
    filters out deleted=true objects based on permission.

    DeletedAwareDAO marks object as deleted instead of actually removing
    the object from DAO then returns thus it should be placed at the end
    of the decorator stack before MDAO so that it wont't cut-off other
    decorators that also override "remove_" and "removeAll_".

    For filtering, objects with deleted=true will be filtered out unless
    the user group has {name}.read.deleted permission where {name} is either
    the lowercase name of the model of the objects by default
    or the {name} provided by the user.
  `,

  properties: [
    {
      class: 'String',
      name: 'name',
      javaFactory: 'return getOf().getClass().getSimpleName().toLowerCase();'
    },
    {
      class: 'String',
      name: 'deletePermission_',
      javaFactory: 'return getName() + ".read.deleted";'
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        DeletedAware obj = (DeletedAware) getDelegate().find_(x, id);

        if ( obj == null || ( obj.getDeleted() && ! canReadDeleted(x) ) ) {
          return null;
        }

        return (FObject) obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        if ( canReadDeleted(x) ) {
          return getDelegate().select_(x, sink, skip, limit, order, predicate);
        }

        return getDelegate()
          .where(MLang.EQ(getOf().getAxiomByName("deleted"), false))
          .select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        if ( obj instanceof DeletedAware ) {
          DeletedAware clone = (DeletedAware) obj.fclone();
          clone.setDeleted(true);
          obj = getDelegate().put_(x, (FObject) clone);
        } else {
          obj = getDelegate().remove_(x, obj); // can remove a non deleted Aware Obj
        }

        return obj;
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
      `
    },
    {
      name: 'canReadDeleted',
      type: 'Boolean',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        AuthService authService = (AuthService) getX().get("auth");
        return authService.check(x, getDeletePermission_());
      `
    }
  ],
});
