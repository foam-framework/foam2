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

      try {
        throw new FOAMExceptionTestTestException();
      } catch (FOAMExceptionTestTestException e) {
        test(e.getMessage().equals("Test exception"), "expecting: Test exception, found: "+e.getMessage());
      }
      try {
        throw new FOAMExceptionTestTestException("inner message");
      } catch (FOAMExceptionTestTestException e) {
        test(e.getMessage().equals("Test exception inner message"), "expecting: Test exception inner message, found: "+e.getMessage());
      }
      `
    }
  ]
});

/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'FOAMExceptionTestTestException',
  package: 'foam.core',
  extends: 'foam.core.FOAMException',
  javaGenerateConvenienceConstructor: false,
  javaGenerateDefaultConstructor: false,

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: 'Test exception {{message_}}'
    }
  ],

  properties: [
    {
      documentation: 'java message template',
      name: 'javaExceptionMessage',
      class: 'String',
      value: 'Test exception {{message_}}',
      transient: true
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public FOAMExceptionTestTestException() {
    getHostname();
  }

  public FOAMExceptionTestTestException(String message) {
    super(message);
  }
        `);
      }
    }
  ],
});
