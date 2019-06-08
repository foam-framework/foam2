/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RulerProbe',
  documentation: `A helper model used to test dao operation for provided "obj".
  Returned with populated appliedRules(Map<Rule, boolean>) property that describes what rules will be applied successfully/unsuccessfully.
  Usage example:
      user = new User();
      rulerProbe = new RulerProbe();
      rulerProbe.setObject(user);
      rulerProbe.setOperation(CREATE);
      rulerProbe = userDAO.cmd(rulerProbe);`,

  properties: [
    {
      class: 'List',
      javaType: 'java.util.ArrayList<TestedRule>',
      name: 'appliedRules',
      javaFactory: 'return new java.util.ArrayList<TestedRule>();'
    },
    {
      class: 'Object',
      name: 'object'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation'
    }
  ],

  methods: [
    {
      name: 'addTestedRule',
      args: [
        { name: 'id', type: 'Long' },
        { name: 'message', type: 'String' },
        { name: 'applied', type: 'Boolean' }
       ],
      javaCode: `getAppliedRules().add(new TestedRule(id, message, applied));`
    }
  ]
});
