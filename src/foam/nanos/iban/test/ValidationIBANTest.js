/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.iban.test',
  name: 'ValidationIBANTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.iban.*',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'setup',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      `
    },
    {
      name: 'teardown',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      `
    },
    {
      name: 'runTest',
      javaCode: `
      setup(x);
      try {
        ValidationIBAN vban = new ValidationIBAN(x);

        // test parsing
        IBANInfo info = vban.parse("--1800360305000010009795493C1");
        test( info == null, "Format not found");

        // Brazil
        // ["BRFF FFFF FFFF FFFF FFFF FFFF FFFU A", "BRkk bbbb bbbb ssss sccc cccc ccct n", "BR97 0036 0305 0000 1000 9795 493P 1"],
        info = vban.parse("BR9700360305000010009795493P1");
        test( info != null, "Format found");
        if ( info != null ) {
          test( "BR".equals(info.getCountry()), "Country parsed");
          test( "00360305".equals(info.getBankCode()), "BankCode parsed");
          test( "00001".equals(info.getBranch()), "Branch parsed");
          test( "0009795493P1".equals(info.getAccountNumber()), "Account parsed");
        }
        // same but with spaces in input
        info = vban.parse("BR97 0036 0305 0000 1000 9795 493P 1");
        test( info != null, "Format found");
        if ( info != null ) {
          test( "BR".equals(info.getCountry()), "Country parsed");
          test( "00360305".equals(info.getBankCode()), "BankCode parsed");
          test( "00001".equals(info.getBranch()), "Branch parsed");
          test( "0009795493P1".equals(info.getAccountNumber()), "Account parsed");
        }
      } catch ( Exception e ) {
        test(false, e.getMessage());
      } finally {
        teardown(x);
      }
      `
    }
  ]
});
