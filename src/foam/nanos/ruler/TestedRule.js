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
      class: 'Boolean',
      name: 'passed',
      value: true
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
      name: 'describeRule',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaCode: `Rule rule = findRule(x);
  StringBuilder sb = new StringBuilder();
  return sb.append("Rule ").append(rule.getId()).append(". Description: ").append(rule.getDocumentation()).
  append( "{ ").append(super.toString()).append("}").toString();`
    }
  ]
});
