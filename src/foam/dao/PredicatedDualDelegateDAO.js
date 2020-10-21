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
    the option Delegate (PredicatedDualDelegateDAO.predicatedDelegate). 
    Passing to the option delegate will occur if the
    PredicatedDualDelegateDAO.predicate evaluates to true.

    To use, add PredicatedDualDelegateDAO as the delegate of the proxyDAO you want to start branching from.

    Currently only supports put_ and remove_.

    // ! Important
    The delegate & predicatedDelegate have to be an instance of ProxyDAO if this dao is going
    to be used as the decorator in setDecorator for EasyDAO
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.NullDAO'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDelegate'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
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
          return getPredicatedDelegate();
        }

        return getDelegate();
      `
    }
  ],
});
