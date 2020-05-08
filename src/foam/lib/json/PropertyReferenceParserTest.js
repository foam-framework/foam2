/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'PropertyReferenceParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.parse.*',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        String input = "{\\"class\\":\\"__Property__\\",\\"forClass_\\":\\"foam.nanos.auth.User\\",\\"name\\":\\"id\\"}";
        PropertyReferenceParserTest_ValidPropertyReference(
          x, input, User.ID, "Parsed property reference successfully");

        String input2 = "{\\"class\\":\\"__Property__\\",\\"forClass_\\":\\"foam.nanos.auth.User\\",\\"name\\": \\"id\\"}";
        PropertyReferenceParserTest_ValidPropertyReference(
          x, input2, User.ID, "Parsed property reference (ignore spacing) successfully");
      `
    },
    {
      name: 'PropertyReferenceParserTest_ValidPropertyReference',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'data',
          type: 'String'
        },
        {
          name: 'expected',
          javaType: 'foam.core.PropertyInfo'
        },
        {
          name: 'message',
          type: 'String'
        },
      ],
      javaCode: `
        // setup parser
        Parser parser = new PropertyReferenceParser();
        StringPStream ps = new StringPStream(new Reference<>(data));
        ParserContext psx = new ParserContextImpl();
        psx.set("X", x);

        // attempt parsing
        ps = (StringPStream) ps.apply(parser, psx);
        test(ps != null && expected.equals(ps.value()), message);
      `
    }
  ]
});
