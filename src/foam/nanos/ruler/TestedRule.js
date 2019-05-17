/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'TestedRule',
  documentation: `The model is for reporting purposes when probing rules.
  rulerProbe = dao.cmd(RulerProbe) object will be returned with array of TestedRules
  that describe whether the rule was applied and summary of the rule's activities.`,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.Rule',
      name: 'rule'
    },
    {
      class: 'String',
      name: 'descrition'
    },
    {
      class: 'Boolean',
      name: 'passed',
      value: true
    }
  ]
});
