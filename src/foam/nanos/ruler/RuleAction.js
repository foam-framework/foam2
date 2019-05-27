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
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' },
        { name: 'ruler', type: 'foam.nanos.ruler.RuleEngine' }
      ]
    },
    {
      name: 'applyReverseAction',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' },
        { name: 'ruler', type: 'foam.nanos.ruler.RuleEngine' }
      ],
      documentation: 'if one of the rules in a group throws an exception we need a way to reverse actions for previously executed rules.'
    },
    {
      name: 'canExecute',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'FObject' },
        { name: 'oldObj', type: 'FObject' },
        { name: 'ruler', type: 'foam.nanos.ruler.RuleEngine' }
      ],
      documentation: 'Predicts effect of the action without actually applying it.' +
      'E.g. if exception is expected, returns false.'
    },
    {
      name: 'describe',
      type: 'String',
      documentation: 'Describes purpose of the action and possible output.'
    }
  ]
});
