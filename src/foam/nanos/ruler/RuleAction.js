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
      type: 'foam.nanos.ruler.ActionResult',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ]
    }
  ]
});

foam.INTERFACE({
  package: 'foam.nanos.ruler',
  name: 'AsyncRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Async rule action interface.'
});
