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
  Does not probe async actions. 
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
      factory: function() {
        return [];
      },
      javaFactory: 'return new java.util.ArrayList();'
    },
    {
      class: 'Object',
      name: 'object'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation'
    },
    {
      name: 'passed',
      class: 'Boolean',
      javaGetter: `
      for ( TestedRule rule : getAppliedRules() ) {
        if ( ! rule.getPassed() ) return false;
      }
        return true;
      `,
      expression: function(appliedRules) {
        console.log(this);
        for ( rule in appliedRules ) {
          if ( ! rule.passed ) return false;
        }
        return true;
      }
    }
  ]
});
