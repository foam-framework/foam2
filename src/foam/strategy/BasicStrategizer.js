/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.strategy',
  name: 'BasicStrategizer',

  documentation: 'A basic implementation of the StrategizerService interface.',

  implements: [
    'foam.strategy.StrategizerService'
  ],

  imports: [
    'strategyDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.util.SafetyUtil',
    'java.util.List',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR'
  ],

  methods: [
    {
      name: 'query',
      javaCode: `
        if ( SafetyUtil.isEmpty(desiredModelId) ) {
          throw new RuntimeException("A desired model id must be specified.");
        }

        Predicate predicate = SafetyUtil.isEmpty(target)
          ? AND(
              EQ(StrategyReference.DESIRED_MODEL_ID, desiredModelId),
              EQ(StrategyReference.TARGET, "")
            )
          : AND(
              EQ(StrategyReference.DESIRED_MODEL_ID, desiredModelId),
              OR(
                EQ(StrategyReference.TARGET, ""),
                EQ(StrategyReference.TARGET, target)
              )
            );

        if ( strategyPredicate != null  ) {
          predicate = (Predicate) strategyPredicate;
        }

        DAO strategyDAO = ((DAO) getStrategyDAO()).inX(x);
        List refs = ((ArraySink) strategyDAO
          .where(predicate)
          .select(new ArraySink())).getArray();

        return (StrategyReference[]) refs.toArray(new StrategyReference[refs.size()]);
      `
    }
  ]
});
