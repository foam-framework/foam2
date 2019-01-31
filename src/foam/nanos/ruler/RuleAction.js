/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.ruler',
  name: 'RuleAction',
  documentation: 'Interface for an action implemented in a rule.',

  methods: [
    {
      name: 'applyAction',
      javaReturns: 'void',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'obj', javaType: 'foam.core.FObject' },
        { name: 'oldObj', javaType: 'foam.core.FObject' }
      ]
    }
  ]
});
