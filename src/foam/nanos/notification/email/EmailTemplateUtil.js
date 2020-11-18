/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateUtil',

  javaImports: [
    'foam.lib.parse.Grammar',
    'foam.lib.parse.Action',
    'foam.lib.parse.*',
    'java.util.HashMap',
    'java.util.Map',
    'foam.lib.json.*',
    'java.lang.StringBuilder'
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'java.lang.StringBuilder',
      name: 'sb',
      javaFactory: `return new StringBuilder();`
    },
    {
      class: 'Map',
      name: 'values'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Grammar',
      name: 'grammar',
      javaFactory: `
        Grammar grammar = new Grammar();
        grammar.addSymbol("START", grammar.sym("markup"));


        // markup symbol defines the pattern for the whole string
        grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("IF_ELSE"), grammar.sym("IF"), grammar.sym("SIMPLE_VAL"),
          grammar.sym("ANY_CHAR"))));
        Action markup = new Action() {
          @Override
          public Object execute(Object value, ParserContext x) {
            return getSb().toString();
          }
        };
        grammar.addAction("markup", markup);


        // ANY_KEY symbol applies to any char that doesn't match any other pattern
        grammar.addSymbol("ANY_CHAR", AnyChar.instance());
        Action anyCharAction = new Action() {
          @Override
          public Object execute(Object val, ParserContext x) {
            getSb().append(val);
            return val;
          }
        };
        grammar.addAction("ANY_CHAR", anyCharAction);


        // simple value syntax: "qwerty {{ simple_value }} qwerty"
        grammar.addSymbol("SIMPLE_VAL", new Seq1(2, Literal.create("{{"), Whitespace.instance(),
          new Repeat0(new AnyKeyParser()), Whitespace.instance() ,Literal.create("}}") ));
        Action simpleValAction = new Action() {
          @Override
          public Object execute(Object val, ParserContext x) {
            String value = (String) getValues().get(val);
            if ( value == null ) {
              value = "undefined";
              foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x_.get("logger");
              logger.error("No value provided for variable " + val);
            }
            getSb().append(value);
            return value;
          }
        };
        grammar.addAction("SIMPLE_VAL", simpleValAction);


        /* IF_ELSE syntax: "qwerty {% if var_name_provided_in_map %} qwer {{ possible_simple_value }} erty
        {% else %} qwerty {% endif %}" */
        Parser ifElseParser = new Seq3(4, 7, 13,
          Literal.create("{%"),
          Whitespace.instance(),
          Literal.create("if"),
          Whitespace.instance(),
          new Repeat(new Until(Literal.create("%}"))),
          Whitespace.instance(),
          Literal.create("%}"),
          (new Repeat(new Until(Literal.create("{%")))),
          Literal.create("{%"),
          Whitespace.instance(),
          Literal.create("else"),
          Whitespace.instance(),
          Literal.create("%}"),
          (new Repeat(new Until(Literal.create("{%")))),
          Literal.create("{%"),
          Whitespace.instance(),
          Literal.create("endif"),
          Whitespace.instance(),
          Literal.create("%}")
        );

        grammar.addSymbol("IF_ELSE", ifElseParser);
        Action ifElseAction  = new Action() {
          @Override
          public Object execute(Object val, foam.lib.parse.ParserContext x) {
            Object[] valArr = (Object[]) val;
            StringBuilder ifCond = new StringBuilder();
            Object[] val0 = (Object[]) valArr[0];
            for ( int i= 0; i < val0.length; i++ ) {
              if ( ! Character.isWhitespace((char)val0[i]) ) ifCond.append(val0[i]);
            }

            StringBuilder finalVal = new StringBuilder();
            if ( getValues().get(ifCond.toString() ) != null ) {
              Object[] val1 = (Object[]) valArr[1];
              for ( int i= 0; i < val1.length; i++ ) {
                finalVal.append(val1[i]);
              }
            } else {
              Object[] val2 = (Object[]) valArr[2];
              for ( int i= 0; i < val2.length; i++ ) {
                finalVal.append(val2[i]);
              }
            }
            StringPStream finalValPs = new StringPStream();
            finalValPs.setString(finalVal);
            PStream ret = ((Parser) grammar.sym("markup")).parse(finalValPs, new ParserContextImpl());
            getSb().append(ret.value());
            return val;
          }
        };
        grammar.addAction("IF_ELSE", ifElseAction);


        /* IF symbol syntax: "qwerty {% if var_name_provided_in_map %} qwer {{ possible_simple_value }}
        qwerty {% endif %}" */
        Parser ifParser = new Seq2(4, 8,
          Literal.create("{%"),
          Whitespace.instance(),
          Literal.create("if"),
          Whitespace.instance(),
          new Repeat(new Until(Literal.create("%}"))),
          Whitespace.instance(),
          Literal.create("%}"),
          Whitespace.instance(),
          (new Repeat(new Until(Literal.create("{%")))),
          Whitespace.instance(),
          Literal.create("{%"),
          Whitespace.instance(),
          Literal.create("endif"),
          Whitespace.instance(),
          Literal.create("%}"));

        grammar.addSymbol("IF", ifParser);
        Action ifAction  = new Action() {
          @Override
          public Object execute(Object val, foam.lib.parse.ParserContext x) {
            Object[] valArr = (Object[]) val;
            StringBuilder ifCond = new StringBuilder();
            Object[] val0 = (Object[]) valArr[0];
            for ( int i= 0; i < val0.length; i++ ) {
              if ( ! Character.isWhitespace((char)val0[i]) ) ifCond.append(val0[i]);
            }

            StringBuilder finalVal = new StringBuilder();
            if ( getValues().get(ifCond.toString() ) != null ) {
              Object[] val1 = (Object[]) valArr[1];
              for ( int i= 0; i < val1.length; i++ ) {
                finalVal.append(val1[i]);
              }
              StringPStream finalValPs = new StringPStream();
              finalValPs.setString(finalVal);
              PStream ret = ((Parser) grammar.sym("markup")).parse(finalValPs, new ParserContextImpl());
              getSb().append(ret.value());
            }
            return val;
          }
        };
        grammar.addAction("IF", ifAction);

        return grammar;
      `
    }
  ],

  methods: [
    {
      name: 'renderTemplate',
      args: [
        { name: 'body', type: 'String' },
        { name: 'values', type: 'Map' },
        { name: 'x', type: 'foam.core.X' },
      ],
      type: 'String',
      javaCode: `
      setValues(values);
      getGrammar().parseString(body, "");
      System.out.println(getSb().toString());
      return getSb().toString();
      `
    }
  ]
});
