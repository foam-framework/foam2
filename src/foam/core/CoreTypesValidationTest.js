/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'CoreTypesValidationTestModel',
  properties: [
    { name: 'id', class: 'String' },
    {
      name: 'testDate', class: 'DateTime'
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'CoreTypesValidationTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.ValidatingDAO',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'runTest',

      javaCode: `
      CoreTypesValidationTestModel testModel =
        new CoreTypesValidationTestModel.Builder(getX())
          .setTestDate(new Date(8640000000000001L))
          .build();

      boolean throwsIllegalState = false;
      
      DAO m = new MDAO(testModel.getClassInfo());
      DAO v = new ValidatingDAO(getX(), m);
      try {
        v.put(testModel);
      } catch (IllegalStateException e) {
        throwsIllegalState = true;
      } 

      test(throwsIllegalState,
        "Invalid date property should not pass ValidatingDAO"
      );
      `
    }
  ]
});
