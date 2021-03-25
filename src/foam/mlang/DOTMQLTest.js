/**
 @license
 Copyright 2021 The FOAM Authors. All Rights Reserved.
 http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'DOTMQLTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.comics.v2.userfeedback.UserFeedback',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.MQL'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      User user = new User();
      UserFeedback feedback1 = new UserFeedback();
      feedback1.setMessage("1(abc))");

      UserFeedback feedback2 = new UserFeedback();
      feedback2.setMessage("def2");

      feedback1.setNext(feedback2);
      user.setUserFeedback(feedback1);

      test(MQL("userFeedback.message=\\\"1(abc))\\\"").f(user), "userFeedback.message = 1(abc))");
      test(! MQL("userFeedback.message=\\\"1(abc)))\\\"").f(user), "userFeedback.message != 1(abc)))");
      test(MQL("userFeedback.next.message=def2").f(user), "userFeedback.next.message = def2");
      test(! MQL("userFeedback.next.message=def").f(user), "userFeedback.next.message != def");
      test(MQL("userFeedback.next(message=def2)").f(user), "userFeedback.next(message = def2");
      test(MQL("userFeedback(message=\\\"1(abc))\\\" and next.message=\\\"def2\\\")").f(user), "userFeedback(message = 1(abc)) and next.message=def2)");
      test(MQL("userFeedback(message=\\\"1(abc))\\\" and next(message=\\\"def2\\\"))").f(user), "userFeedback(message = 1(abc)) and next(message=def2))");
      `
    },
    {
      name: 'isValid',
      type: 'Boolean',
      args : [
        { name: 'query',type: 'String' },
        { name: 'statement',type: 'String' }
      ],
      javaCode: ``
    },
  ]
});
