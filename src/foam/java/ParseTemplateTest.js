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
      template: `Hello. My name is ${{ name }}. Blame me for this test failure`,
      name: `testTemplate`
    }
  ],

  properties: [
    {
      name: 'name',
      value: 'Kristina Smirnova'
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
        String finalStr = "Hello. My name is Kristina Smirnova. Blame me for this test failure";
        ParseTemplateTestModel testModel = new ParseTemplateTestModel();
        StringBuilder sb = new StringBuilder();
        testModel.buildTemplate(sb);

        test(! threw, "Admin user can add plaidAccountDetail");
      `
    }
  ]
});
