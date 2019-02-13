/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'Rule',
  extends: 'foam.nanos.ruler.AbstractRule',

  documentation: 'Rule model represents rules(actions) that need to be applied in case passed object satisfies provided predicate.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      javaFactory: `
      return foam.mlang.MLang.TRUE;
      `,
      documentation: 'predicate is checked against an object; if returns true, the action is executed.'+
      'Defaults to return true.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'action',
      javaFactory: `
      return new RuleAction() {
        @Override
        public void applyAction(X x, FObject obj, FObject oldObj) {}
      };`,
      documentation: 'The action to be executed if predicates returns true for passed object.'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: 'return getPredicate().f(obj);'
    }
  ]
});
