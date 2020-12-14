/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'Ruled',
  abstract: true,

  documentation: 'Abstract protocol/trait for rule-like models.',

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Enables the rule.',
      value: true,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Int',
      name: 'priority',
      documentation: `Priority defines the order in which rules are to be applied.
        Rules with a higher priority are to be applied first.
        The convention for values is ints that are multiple of 10.
      `,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      documentation: 'predicate is checked against an object; if returns true, the action is executed. Defaults to return true.',
      factory: function () { return this.TRUE; },
      javaFactory: 'return foam.mlang.MLang.TRUE;'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.RuleGroup',
      name: 'ruleGroup',
      documentation: 'The name of the ruleGroup associated with the rule.'
    }
  ],

  methods: [
    {
      name: 'f',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        if ( ! getEnabled() ) return false;

        try {
          return getPredicate().f(x.put("OBJ", this));
        } catch ( Throwable t ) {
          try {
            return getPredicate().f(this);
          } catch ( Throwable th ) { }

          ((Logger) x.get("logger")).error("Failed to evaluate predicate on",
            "class: " + getClass().getName(), "id: " + getId(), t);
          return false;
        }
      `
    }
  ]
});
