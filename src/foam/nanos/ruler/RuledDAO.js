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
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
        if ( obj instanceof FindRuledCommand ) {
          var sink = (ArraySink) getDelegate()
            .where(AND(
              INSTANCE_OF(Ruled.getOwnClassInfo()),
              EQ(Ruled.RULE_GROUP, ((FindRuledCommand) obj).getRuleGroup()) ))
            .orderBy(DESC(Ruled.PRIORITY))
            .select(new ArraySink());

          for ( var o : sink.getArray() ) {
            if ( ((Ruled) o).f(x) ) {
              return o;
            }
          }
          return null;
        }
        return getDelegate().cmd_(x, obj);
      `
    }
  ]
})
