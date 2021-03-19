/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'FOAMExceptionTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',

      javaCode: `

      try {
        throw new FOAMException();
      } catch (FOAMException e) {
        test(foam.util.SafetyUtil.isEmpty(e.getMessage()), "expecting: empty message, found: "+e.getMessage());
      }
      try {
        throw new FOAMException("test message");
      } catch (FOAMException e) {
        test(e.getMessage().equals("test message"), "expecting: test message, found: "+e.getMessage());
      }
      `
    }
  ]
});
