/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PredicatedDualDelegateDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    PredicatedDualDelegateDAO allows the user to pass a delegate to either 
    the default delegate (PredicatedDualDelegateDAO.delegate) or
    the option Delegate (PredicatedDualDelegateDAO.optionDelegate). 
    Passing to the option delegate will occur if the
    PredicatedDualDelegateDAO.optionPredicate evaluates to true.

    To use, add PredicatedDualDelegateDAO as the delegate of the proxyDAO you want to start branching from.

    Currently only supports put_ and remove_.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.NullDAO'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'predicatedDelegate',
      forwards: [ 'put_', 'remove_', 'find_', 'select_', 'removeAll_', 'cmd_', 'listen_' ],
      topics: [ 'on' ], // TODO: Remove this when all users of it are updated.
      factory: function() { return this.NullDAO.create() },
      postSet: function(old, nu) {
        if ( old ) this.on.reset.pub();
      },
      swiftFactory: 'return NullDAO_create()',
      swiftPostSet: `
        if let oldValue = oldValue as? foam_dao_AbstractDAO {
          _ = oldValue.on["reset"].pub()
        }
      `
      ,
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'optionPredicate',
      factory: function () {
        return foam.mlang.predicate.True.create();
      },
      javaFactory: `
      return foam.mlang.MLang.TRUE;
      `,
      documentation: `
        PredicatedDualDelegateDAO.predicate is checked against an object; 
        if returns true, PredicatedDualDelegateDAO.predicatedDelegate is used.
        else uses PredicatedDualDelegateDAO.delegate.
      `
    },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        return getDelegateFor(obj).put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return getDelegateFor(obj).remove_(x, obj);
      `
    },
    {
      name: 'getDelegateFor',
      type: 'foam.dao.DAO',
      args: [
        { name: 'obj', type: 'foam.core.FObject' },
      ],
      javaCode: `
        if ( getPredicate().f(obj) ) {
          return getOptionDelegate();
        }

        return getDelegate();
      `
    }
  ],
});
