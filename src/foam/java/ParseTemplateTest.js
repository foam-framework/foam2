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
      name: `simpleVarTemplate`
    },
    {
      template: `This <% System.out.print("is java templating");%> test`,
      name: `javaTemplate`
    },
    {
      template: `<% if ( passed ) %> This is my legacy <% else %> Please find somebody to blame`,
      name: `ifElseTemplate`,
      args: [ { name: 'passed', type: 'Boolean' } ],
    },
    {
      name: 'hello',
      args: [ { name: 'name', type: 'String' } ],
      template: 'Hello, my name is <%= name %>.'
    },
  ],

  properties: [
    {
    class: 'String',
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
//        testModel.buildsimpleVarTemplate(sb);

//        test(! threw, "Admin user can add plaidAccountDetail");
      `
    }
  ]
});
