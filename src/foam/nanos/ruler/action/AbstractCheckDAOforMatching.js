/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.action',
  name: 'AbstractCheckDAOforMatching',
  abstract: true,

  documentation: `do a dao call to return a predicated dao of objects matching the properties specified by an input. `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'properties',
      javaFactory: 'return new String[0];'
    },
    {
      class: 'String',
      name: 'daoName'
    },
    {
      class: 'Boolean',
      name: 'readOnly',
      documentation: 'Allows the user to specify whether the find operation is done on read-only DAOs or not.'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        FObject nu  = (FObject) obj;
        Predicate [] propertiesToCheck = new Predicate [getProperties().length] ;

        for ( int i = 0; i < getProperties().length; i++ ) {
          propertiesToCheck[i] = EQ( nu.getClassInfo().getAxiomByName(getProperties()[i]), nu.getProperty(getProperties()[i]) );
        }
        Predicate myPredicate = AND(propertiesToCheck);

        if ( getReadOnly()) {
          DAO myDAO = ((DAO) x.get( getDaoName() )).where(myPredicate);
          cmd(x, nu, myDAO);
        }
        else {
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              DAO myDAO = ((DAO) x.get( getDaoName() )).where(myPredicate);
              cmd(x, nu, myDAO);
            }
          },"DAO find Operation");
        }
      `
    },
    {
      name: 'cmd',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'nu', type: 'foam.core.FObject' },
        { name: 'dao', type: 'foam.dao.DAO' },
      ],
      javaCode: `
       // Template method, add code in sub-class
      `
    },

  ]
});
