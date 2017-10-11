/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.dao.ManyToManyRelationshipDAO',

  javaImports: [ 'foam.mlang.MLang' ],

  documentation: 'Waiting on multi-part key support for full support.',

  methods: [
    {
      name: 'find_',
      javaCode: 
      `
      throw new UnsupportedOperationException("Many To Many Relationships await the implementation of multi-part keys in Java");

      // String innerId = (id instanceof foam.core.FObject) ? ((foam.core.FObject) id).getClassInfo().getId() : (String) id;

      // DAO junctionDAO = ((DAO) getX().get(getJunctionDAOKey()));
      // foam.core.FObject results = junctionDAO.find_(x, 
      //   getJunctionFactoryPreOrder() ? new String[]{ getSourceKey(), innerId } : new String[]{ innerId, getSourceKey() });
      
      // if (results == null) return results;

      // return getDelegate().find_(x, innerId);
      `
    },
    {
      name: 'select_',
      javaCode:
      `
      throw new UnsupportedOperationException("Many To Many Relationships await the implementation of multi-part keys in Java");

      // DAO junctionDAO = ((DAO) getX().get(getJunctionDAOKey()));
      // junctionDAO = junctionDAO.where(MLang.EQ(getSourceProperty(), getSourceKey()));

      // Sink listSink = new ListSink();
      // listSink = junctionDAO.select(MLang.MAP(getJunctionProperty(), listSink));

      // return getDelegate().select_(getX(), sink, skip, limit, order, 
      //   MLang.AND(( predicate == null ) ? MLang.TRUE : predicate, 
      //     MLang.IN(getTargetProperty(), ((ListSink) listSink).getData())));
      `
    }
  ]
});
