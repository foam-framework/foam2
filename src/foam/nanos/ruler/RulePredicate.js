/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.ruler',
  name: 'RulePredicate',

  methods: [
    {
      name: 'testX',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'testObj',
      type: 'Boolean',
      args: [
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'AbstractRulePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  implements: [
    'foam.nanos.ruler.RulePredicate'
  ],

  documentation: 'Rule predicate model for use in rule engine.',

  javaImports: [
    'foam.core.X',
    'foam.core.FObject'
  ],

  methods: [
    {
      name: 'test',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        return testX(x)
          && testObj(
            (FObject) x.get(RulerDAO.NEW_OBJ),
            (FObject) x.get(RulerDAO.OLD_OBJ)
          );
      `
    },
    {
      name: 'f',
      javaCode: `
        return obj instanceof X && testX((X) obj);
      `
    }
  ]
});
