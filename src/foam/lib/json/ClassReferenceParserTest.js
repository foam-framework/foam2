/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'ClassReferenceParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.parse.*',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        String input = "{\\"class\\":\\"__Class__\\",\\"forClass_\\":\\"foam.nanos.auth.User\\"}";
        ClassReferenceParserTest_StringWithValidClassReference(x, input, User.class, "Parsed User Class reference parser successfully");;
      `
    },
    {
      name: 'ClassReferenceParserTest_StringWithValidClassReference',
      args: [
        {
          class: 'Object',
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          class: 'String',
          name: 'data'
        },
        {
          class: 'Object',
          name: 'expected',
          javaType: 'Class'
        },
        {
          class: 'String',
          name: 'message'
        },
      ],
      javaCode: `
        // setup parser
        Parser classReferenceParser = new ClassReferenceParser();
        StringPStream ps = new StringPStream(new Reference<>(data));
        ParserContext psx = new ParserContextImpl();
        psx.set("X", x);

        // attempt parsing
        ps = (StringPStream) ps.apply(classReferenceParser, psx);
        test(expected.equals(ps.value()), message);
      `
    }
  ]
});
