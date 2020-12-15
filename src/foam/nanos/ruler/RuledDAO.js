/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuledDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Finds applicable ruled (i.e, rule-like) object by FindRuledCommand.',

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
        if ( obj instanceof FindRuledCommand ) {
          // NOTE: use array to collect the first matching object since plain
          // object re-assignment from within AbstractSink doesn't compile.
          Object[] result = { null };
          getDelegate()
            .where(AND(
              INSTANCE_OF(Ruled.getOwnClassInfo()),
              EQ(Ruled.RULE_GROUP, ((FindRuledCommand) obj).getRuleGroup()) ))
            .orderBy(DESC(Ruled.PRIORITY))
            .select(new AbstractSink() {
              @Override
              public void put(Object o, Detachable s) {
                if ( ((Ruled) o).f(x) ) {
                  result[0] = o;
                  s.detach();
                }
              }
            });
          return result[0];
        }
        return getDelegate().cmd_(x, obj);
      `
    }
  ]
})
