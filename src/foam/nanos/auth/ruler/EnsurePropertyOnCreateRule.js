/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.ruler',
  name: 'EnsurePropertyOnCreateRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: `Rule to set the value of a specific property on the object if
    it had not yet been set when created.

    The rule is run after the object is put/created.

    The predicate of EnsurePropertyOnCreateRule will check for
    1. NEW_OBJ is an instance of the "targetClass"
    2. The "propName" property on NEW_OBJ is not set

    Then EnsurePropertyOnCreateRuleAction will set the object "propName"
    property the value of the "propValue" and re-put the object back to the DAO.
  `,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.ruler.predicate.IsInstancePredicate',
    'foam.nanos.ruler.predicate.PropertyEQValue',
    'foam.nanos.ruler.predicate.PropertyIsSetPredicate',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    'id',
    'name',
    'documentation',
    'enabled',
    'priority',
    'daoKey',
    'ruleGroup',
    {
      class: 'Class',
      name: 'targetClass',
      section: 'basicInfo',
      required: true
    },
    {
      class: 'String',
      name: 'propName',
      section: 'basicInfo',
      required: true
    },
    {
      class: 'Object',
      name: 'propValue',
      section: 'basicInfo',
      required: true
    },
    {
      name: 'predicate',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: `
        var isInstanceOfPredicate = new IsInstancePredicate();
        isInstanceOfPredicate.setOf(getTargetClass());

        var propertyIsSetPredicate = new PropertyIsSetPredicate();
        propertyIsSetPredicate.setPropName(getPropName());

        return AND(
          isInstanceOfPredicate,
          NOT(propertyIsSetPredicate)
        );
      `
    },
    {
      name: 'action',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return new EnsurePropertyOnCreateRuleAction();'
    },
    {
      name: 'operation',
      value: 'CREATE',
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'after',
      value: true,
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'asyncAction',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return null;'
    },
    {
      name: 'saveHistory',
      value: true,
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'validity',
      transient: true,
      visibility: 'HIDDEN'
    }
  ],

  classes: [
    {
      name: 'EnsurePropertyOnCreateRuleAction',
      implements: [ 'foam.nanos.ruler.RuleAction' ],
      methods: [
        {
          name: 'applyAction',
          javaCode: `
            var propertyRule = (EnsurePropertyOnCreateRule) rule;

            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                var clone = obj.fclone();
                clone.setProperty(propertyRule.getPropName(), propertyRule.getPropValue());
                ruler.getDelegate().put(clone);
              }
            }, "Update " + propertyRule.getTargetClass().getId() + " property:" + propertyRule.getPropName());

            ruler.stop();
          `
        }
      ]
    }
  ]
});
