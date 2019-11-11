/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleGroup',

  documentation: 'A rule group groups some rules together, the rules within only run if the ruleGroup predicate evaluates to true.',

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.logger.Logger',
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'documentation',
      readPermissionRequired: true,
      writePermissionRequired: true
    },

    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      view: { class: 'foam.u2.view.JSONTextView' },
      javaFactory: `
      return foam.mlang.MLang.TRUE;
      `,
      documentation: 'predicate is checked against an object; if returns true, the rule group is executed.'+
      'Defaults to return true.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      documentation: 'Enables the rule Group.',
      readPermissionRequired: true,
      writePermissionRequired: true
    }
  ],

  methods: [
    {
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        }
      ],
      javaCode: `
        try {
          return getEnabled()
            && getPredicate().f(
              x.put("NEW", obj).put("OLD", oldObj)
            );
        } catch ( Throwable t ) {
          try {
            return getPredicate().f(obj);
          } catch ( Throwable th ) { }

          ((Logger) x.get("logger")).error(
            "Failed to evaluate predicate of rule: " + getId(), t);
          return false;
        }
      `
    }
  ]
});
