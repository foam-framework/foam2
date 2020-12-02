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
    'foam.dao.*',
    'foam.mlang.MLang',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'java.util.ArrayList',
    'java.util.List'
  ],

  documentation: `
    DAO decorator that handles different lifecycle states 
    (PENDING, REJECTED, APPROVED & DELETED) for objects

    In the case of remove_, LifecycleAwareDAO marks object as DELETED instead of actually removing
    the object from DAO then returns thus it should be placed at the end
    of the decorator stack before MDAO so that it wont't cut-off other
    decorators that also override "remove_" and "removeAll_".

    For filtering, objects with a lifecycle state of DELETED or REJECTED
    will be filtered out unless the user group has lifecyclestate.deleted.{name}
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
      javaFactory: 'return "lifecyclestate.deleted." + getName();'
    },
    {
      class: 'String',
      name: 'rejectPermission_',
      javaFactory: 'return "lifecyclestate.rejected." + getName();'
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);

        // Check if the object is LifecycleAware
        if ( ! ( obj instanceof LifecycleAware ) )
          return obj;

        LifecycleAware lifecycleAwareObj = (LifecycleAware) obj;

        if ( 
            ( lifecycleAwareObj.getLifecycleState() == LifecycleState.DELETED && ! canReadDeleted(x) ) ||  
            ( lifecycleAwareObj.getLifecycleState() == LifecycleState.REJECTED && ! canReadRejected(x) )
          ) {
          return null;
        }

        return obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        // TODO: See CPF-4875 for more info
        // Will need to figure out if the DAO OF is not lifecycleAware, 
        // but a subclass entry may be lifecycleAware

        boolean userCanReadDeleted = canReadDeleted(x);
        boolean userCanReadRejected = canReadRejected(x);

        List<Predicate> predicateList = new ArrayList<>();

        if ( ! userCanReadDeleted ) {
          if ( foam.nanos.auth.LifecycleAware.class.isAssignableFrom(getOf().getObjClass()) )
          {
            Predicate deletedPredicate = MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.DELETED);
            predicateList.add(deletedPredicate);
          }
        }

        if ( ! userCanReadRejected ) {
          Predicate rejectedPredicate = MLang.EQ(getOf().getAxiomByName("lifecycleState"), LifecycleState.REJECTED);
          predicateList.add(rejectedPredicate);
        }
        
        Predicate[] predicateArray = predicateList.toArray(new Predicate[predicateList.size()]);

        AbstractPredicate isLifecycleAwarePredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            return obj instanceof LifecycleAware;
          }
        };

        return ( predicateArray.length == 0 ) ?
        getDelegate().select_(x, sink, skip, limit, order, predicate) :
        getDelegate()
          .where(
              MLang.OR(
                MLang.NOT(
                  isLifecycleAwarePredicate
                ),
                MLang.NOT(
                  MLang.OR(
                    predicateArray
                  )
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
        AuthService authService = (AuthService) x.get("auth");
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
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, getRejectPermission_());
      `
    }
  ],
});
