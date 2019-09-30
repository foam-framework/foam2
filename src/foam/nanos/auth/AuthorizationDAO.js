/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AuthorizationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A DAO decorator to run authorization checks.',
  
  javaImports: [
    'foam.core.FObject',
    'foam.core.InvalidX',
    'foam.core.X',
    'foam.dao.*',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.IS_AUTHORIZED_TO_READ',
    'static foam.mlang.MLang.IS_AUTHORIZED_TO_DELETE'
  ],
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:`
  public AuthorizationDAO(X x, DAO delegate, Authorizer authorizer) {
    AuthorizationException exception = new AuthorizationException("When " +
        "using a DAO decorated by AuthorizationDAO, you may only call the " +
        "context-oriented methods: put_(), find_(), select_(), remove_(), " +
        "removeAll_(). Alternatively, you can also " +
        "use .inX() to set the context on the DAO.");
    setX(new InvalidX(exception));
    setDelegate(delegate);
    setAuthorizer(authorizer);
  }
`
        }));
      }
    }
  ],

  properties: [
    {
      name: 'authorizer',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Authorizer'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaThrows: [
        'foam.nanos.auth.AuthorizationException'
      ],
      javaCode: `
   if ( obj == null ) throw new RuntimeException("Cannot put null.");

    Object id = obj.getProperty("id");
    FObject oldObj = getDelegate().inX(x).find(id);
    boolean isCreate = id == null || oldObj == null;

    if ( isCreate ) {
      getAuthorizer().authorizeOnCreate(x, obj);
    } else {
      getAuthorizer().authorizeOnUpdate(x, oldObj, obj);
    }

    return super.put_(x, obj);
`
    },
    {
      name: 'remove_',
      javaCode: `
    Object id = obj.getProperty("id");
    FObject oldObj = getDelegate().inX(x).find(id);
    if ( id == null || oldObj == null ) return null;
    getAuthorizer().authorizeOnDelete(x, oldObj);
    return super.remove_(x, obj);
 `
    },
    {
      name: 'find_',
      javaCode: `
    if ( id == null ) return null;
    if ( getAuthorizer().checkGlobalRead(x) ) return super.find_(x, id);

    FObject obj = super.find_(x, id);
    if ( obj != null ) getAuthorizer().authorizeOnRead(x, obj);
    return obj;
 `
    },
    {
      name: 'select_',
      javaCode: `
    if ( ! getAuthorizer().checkGlobalRead(x) ) predicate = augmentPredicate(x, false, predicate);
    return super.select_(x, sink, skip, limit, order, predicate);
 `
    },
    {
      name: 'removeAll_',
      javaCode: `
    if ( ! getAuthorizer().checkGlobalRemove(x) ) predicate = augmentPredicate(x, true, predicate);
    this.select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
 `
    },
    {
      name: 'augmentPredicate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'remove',
          type: 'Boolean'
        },
        {
          name: 'existingPredicate',
          type: 'Predicate'
        }
      ],
      javaType: 'Predicate',
      javaCode: `
    Predicate newPredicate = remove ? IS_AUTHORIZED_TO_DELETE(x, getAuthorizer()) : IS_AUTHORIZED_TO_READ(x, getAuthorizer());
    return existingPredicate != null ?
      AND(
        existingPredicate,
        newPredicate
      ) :
      newPredicate;
 `
    }
  ]
});
