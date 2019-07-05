/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'TestedRule',
  extends: 'foam.core.CompoundContextAgency',
  documentation: `The model is for reporting purposes when probing rules.
  rulerProbe = dao.cmd(RulerProbe) object will be returned with list of TestedRules
  where each describes whether the rule was applied and summary of the rule's activities.`,

  javaImports: [
    'foam.nanos.ruler.Rule',
    'java.util.ArrayList',
    'foam.core.X'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.Rule',
      name: 'rule'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Boolean',
      name: 'passed',
      value: true
    },
    {
      class: 'FObjectProperty',
      name: 'probeInfo'
    }
  ],
  methods: [
    {
      name: 'execute',
      args: [
        { name: 'x', type: 'X' }
      ],
      javaCode: `// the agent is not to be executed.`
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `StringBuilder sb = new StringBuilder();
      return sb.append("Rule id: ").append(getRule()).append(". Passed: ").append(getPassed()).
      append( ". Message: ").append(getMessage()).toString();`
    }
  ]
});
