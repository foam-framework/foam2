/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.java',
  name: 'ParseTemplateTestModel',

  templates: [
    {
      template: `Hello, my name is <%= name %>`,
      name: `testRawValue`
    },
    {
      name: 'testRawValueWithArg',
      args: [ { name: 'name', type: 'String' } ],
      template: 'argument name value: <%= name %>'
    },
    {
      template: `<% if ( testsPassed ) %>This is my legacy<% else %>Please find somebody to blame`,
      name: `testCode`,
      args: [ { name: 'testsPassed', type: 'Boolean' } ],
    }
  ],

  properties: [
    {
    class: 'String',
      name: 'name',
      value: 'Kristina'
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'ParseTemplateTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.lang.StringBuilder'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        ParseTemplateTestModel testModel = new ParseTemplateTestModel();
        StringBuilder sb = new StringBuilder();
        testModel.buildTestRawValue(sb);
        boolean passed1 = sb.toString().equals("Hello, my name is Kristina");
        test(passed1, "Raw value template give the correct output");

        sb = new StringBuilder();
        testModel.buildTestRawValueWithArg(sb, "random");
        boolean passed2 = sb.toString().equals("argument name value: random");
        test(passed2, "Raw value with arguments gives the correct output");

        sb = new StringBuilder();
        boolean testPassed = passed1 && passed2;
        testModel.buildTestCode(sb, testPassed);
        boolean passed3 = testPassed ? sb.toString().equals("This is my legacy") : sb.toString().equals("Please find somebody to blame");
        test(passed3, "Code block gives the correct output");
      `
    }
  ]
});
