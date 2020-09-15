/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'OptionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    OptionDAO allows for two different dao branches based on a predicate evaluation.
    Currently only supports put_ and  remove_.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.NullDAO'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'optionDelegate',
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
      documentation: 'OptionDAO.optionPredicate is checked against an object; if returns true, OptionDAO.optionDelegate is used.'+
      'Default uses OptionDAO.delegate.'
    },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if  ( getOptionPredicate().f(obj) ) {
          DAO optionDelegate = (DAO) getOptionDelegate();

          return optionDelegate.put_(x, obj);
        }

        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        if  ( getOptionPredicate().f(obj) ) {
          DAO optionDelegate = (DAO) getOptionDelegate();

          return optionDelegate.remove_(x, obj);
        }

        return getDelegate().remove_(x, obj);
      `
    },
  ],
});
