/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LifecycleAwareDAO',
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
    DAO decorator that handles different lifecycle states 
    (PENDING, REJECTED, APPROVED & DELETED) for objects

    In the case of remove_, LifecycleAwareDAO marks object as DELETED instead of actually removing
    the object from DAO then returns thus it should be placed at the end
    of the decorator stack before MDAO so that it wont't cut-off other
    decorators that also override "remove_" and "removeAll_".

    For filtering, objects with a lifecycle state of DELETED or REJECTED
    will be filtered out unless the user group has {name}.read.lifecyclestate.deleted 
    and/or {name}.read.lifecyclestate.rejected respectively permission where {name} is 
    either the lowercase name of the model of the objects by default or the {name} provided by the user.
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
      javaFactory: 'return "lifecyclestate.deleted.read." + getName();'
    },
    {
      class: 'String',
      name: 'rejectPermission_',
      javaFactory: 'return "lifecyclestate.rejected.read." + getName();'
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);

        LifecycleAware lifecycleAwareObj = (LifecycleAware) obj;

        // ! we are also handling the deprecated DeletedAware until we fully remove it from the system
        if ( obj instanceof DeletedAware ){
          DeletedAware deletedAwareObj = (DeletedAware) obj;

          if ( obj == null || 
            ( ( lifecycleAwareObj.getLifecycleState() == LifecycleState.DELETED || deletedAwareObj.getDeleted() == true ) && ! canReadDeleted(x) ) ||  
            ( lifecycleAwareObj.getLifecycleState() == LifecycleState.REJECTED && ! canReadRejected(x)) ) {
            return null;
          }
          return obj;
        }

        if ( obj == null || 
          ( lifecycleAwareObj.getLifecycleState() == LifecycleState.DELETED && ! canReadDeleted(x) ) ||  
          ( lifecycleAwareObj.getLifecycleState() == LifecycleState.REJECTED && ! canReadRejected(x)) ) {
          return null;
        }

        return obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        boolean userCanReadDeleted = canReadDeleted(x);
        boolean userCanReadRejected = canReadRejected(x);

        if ( userCanReadDeleted && userCanReadRejected ) {
          return getDelegate().select_(x, sink, skip, limit, order, predicate);
        }

        if ( userCanReadDeleted && ! userCanReadRejected ) {
          return getDelegate()
            .where(
              MLang.NOT(
                MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.REJECTED)
              )
            )
            .select_(x, sink, skip, limit, order, predicate);
        }

        // ! we are also handling the deprecated DeletedAware until we fully remove it from the system
        if ( getOf().getAxiomByName("deleted") != null ){
          if ( ! userCanReadDeleted && userCanReadRejected ) {
            return getDelegate()
              .where(
                MLang.NOT(
                  MLang.OR(
                    MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.DELETED),
                    MLang.EQ(getOf().getAxiomByName("deleted"), true)
                  )
                )
              )
              .select_(x, sink, skip, limit, order, predicate);
          }

          return getDelegate()
            .where(
              MLang.NOT(
                MLang.OR(
                  MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.DELETED),
                  MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.REJECTED),
                  MLang.EQ(getOf().getAxiomByName("deleted"), true)
                )
              )
            )
            .select_(x, sink, skip, limit, order, predicate);
        }

        if ( ! userCanReadDeleted && userCanReadRejected ) {
          return getDelegate()
            .where(
              MLang.NOT(
                MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.DELETED)
              )
            )
            .select_(x, sink, skip, limit, order, predicate);
        }

        return getDelegate()
          .where(
            MLang.NOT(
              MLang.OR(
                MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.DELETED),
                MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.REJECTED)
              )
            )
          )
          .select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        if ( obj instanceof LifecycleAware ) {
          LifecycleAware clone = (LifecycleAware) obj.fclone();
          clone.setLifecycleState(LifecycleState.DELETED);
          obj = getDelegate().put_(x, (FObject) clone);
        } else {
          obj = getDelegate().remove_(x, obj); // can remove a non lifecycle Aware Obj
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
    },
    {
      name: 'canReadRejected',
      type: 'Boolean',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        AuthService authService = (AuthService) getX().get("auth");
        return authService.check(x, getRejectPermission_());
      `
    }
  ],
});
