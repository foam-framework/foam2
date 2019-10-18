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
      CoreTypesValidationTestModel testModelInvalidHigh =
        new CoreTypesValidationTestModel.Builder(getX())
          .setTestDate(new Date(8640000000000001L))
          .build();
      CoreTypesValidationTestModel testModelValidHigh =
        new CoreTypesValidationTestModel.Builder(getX())
          .setTestDate(new Date(8640000000000000L))
          .build();
      CoreTypesValidationTestModel testModelInvalidLow =
        new CoreTypesValidationTestModel.Builder(getX())
          .setTestDate(new Date(-8640000000000001L))
          .build();
      CoreTypesValidationTestModel testModelValidLow =
        new CoreTypesValidationTestModel.Builder(getX())
          .setTestDate(new Date(-8640000000000000L))
          .build();

      boolean throwsIllegalState = false;
      
      DAO m = new MDAO(
        CoreTypesValidationTestModel.getOwnClassInfo());
      DAO v = new ValidatingDAO(getX(), m);

      try {
        v.put(testModelInvalidHigh);
      } catch (IllegalStateException e) {
        throwsIllegalState = true;
      }
      test(throwsIllegalState,
        "Invalid date property (too high) should not pass ValidatingDAO"
      );
      throwsIllegalState = false;

      try {
        v.put(testModelInvalidLow);
      } catch (IllegalStateException e) {
        throwsIllegalState = true;
      }
      test(throwsIllegalState,
        "Invalid date property (too low) should not pass ValidatingDAO"
      );
      throwsIllegalState = false;

      try {
        v.put(testModelValidHigh);
      } catch (IllegalStateException e) {
        throwsIllegalState = true;
      }
      test(( ! throwsIllegalState ),
        "Valid date property (upper bound) should pass ValidatingDAO"
      );
      throwsIllegalState = false;

      try {
        v.put(testModelValidLow);
      } catch (IllegalStateException e) {
        throwsIllegalState = true;
      }
      test(( ! throwsIllegalState ),
        "Valid date property (lower bound) should pass ValidatingDAO"
      );
      throwsIllegalState = false;
      `
    }
  ]
});
