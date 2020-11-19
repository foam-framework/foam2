/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateUtil',

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.*',
    'foam.lib.parse.*',
    'foam.lib.parse.Action',
    'foam.lib.parse.Grammar',
    'java.lang.StringBuilder',
    'java.util.HashMap',
    'java.util.Map',
    'static foam.mlang.MLang.EQ'

  ],

  properties: [
    {
      class: 'Object',
      javaType: 'java.lang.StringBuilder',
      name: 'sb',
      javaFactory: `return new StringBuilder();`,
      documentation: `this StringBuilder is used to store the final parsed value`
    },
    {
      class: 'Object',
      javaType: 'java.lang.StringBuilder',
      name: 'finalSb',
      javaFactory: `return new StringBuilder();`,
      documentation: `this temporary StringBuilder with non-parsed values is used to join
        two templates in case if one extends another`
    },
    {
      class: 'Map',
      name: 'values',
      documentation: `map of values of values for simple values where {{ key }} will be replaced with value`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.notification.email.EmailTemplate',
      name: 'extendedEmailTemplate',
      documentation: `If provided email template extends another email template,
          it will be stored in this prop`
    },
    {
      class: 'Object',
      javaType: 'java.lang.StringBuilder',
      name: 'blockContentSb',
      javaFactory: `return new StringBuilder();`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Grammar',
      name: 'grammar',
      documentation: `grammar for parsing "{{ val }}", "{% if/else}}" symbols`,
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
        Parser ifElseParser = new SeqI(new int[] { 4, 7, 13 },
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
            for ( int i = 0 ; i < val0.length ; i++ ) {
              if ( ! Character.isWhitespace((char)val0[i]) ) ifCond.append(val0[i]);
            }

            StringBuilder finalVal = new StringBuilder();
            if ( getValues().get(ifCond.toString() ) != null ) {
              Object[] val1 = (Object[]) valArr[1];
              for ( int i = 0 ; i < val1.length ; i++ ) {
                finalVal.append(val1[i]);
              }
            } else {
              Object[] val2 = (Object[]) valArr[2];
              for ( int i = 0 ; i < val2.length ; i++ ) {
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
            for ( int i = 0 ; i < val0.length ; i++ ) {
              if ( ! Character.isWhitespace((char)val0[i]) ) ifCond.append(val0[i]);
            }

            StringBuilder finalVal = new StringBuilder();
            if ( getValues().get(ifCond.toString() ) != null ) {
              Object[] val1 = (Object[]) valArr[1];
              for ( int i = 0 ; i < val1.length ; i++ ) {
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
        { name: 'body', type: 'String' }
      ],
      type: 'StringBuilder',
      javaCode: `

      // if the template doesn't extend any other template, parse the original body.
      // Otherwise join two templates and then parse
      if ( ! isMultiTemplated(body) ) {
        getGrammar().parseString(body, "");
      }
      else {
        getGrammar().parseSb(getFinalSb(), "");
      }
      return getSb();
      `
    },
    {
      name: 'isMultiTemplated',
      args: [
        { name: 'body', type: 'String' }
      ],
      type: 'Boolean',
      documentation: `checks if template extends another templates, if yes, joins two and returns true`,
      javaCode: `

      extractSuperEmailTemplateAndBlockContent(body);

      if ( getBlockContentSb().length() == 0 ||
              getExtendedEmailTemplate() == null ) return false;

      joinTemplates();

      return true;
      `
    },
    {
      name: 'extractSuperEmailTemplateAndBlockContent',
      args: [
        { name: 'body', type: 'String' }
      ],
      javaCode: `
      Grammar grammar = new Grammar();
      grammar.addSymbol("START", grammar.sym("markup"));

      grammar.addSymbol("markup", new Repeat0(new Alt(
              grammar.sym("BLOCK_CONTENT"), grammar.sym("EXTENDS"), grammar.sym("ANY_CHAR"))));

      grammar.addSymbol("ANY_CHAR", AnyChar.instance());
      Action anyCharAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          getFinalSb().append(val);
          return val;
        }
      };
      grammar.addAction("ANY_CHAR", anyCharAction);

      grammar.addSymbol("EXTENDS", new Seq1(5,
        Literal.create("{%"),
        Whitespace.instance(),
        Literal.create("extends"),
        Whitespace.instance(),
        Literal.create("'"),
        new Repeat(new Until(Literal.create("'"))),
        Literal.create("'"),
        Whitespace.instance(),
        Literal.create("%}"))
      );
      Action extendsAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          if ( val == null ) return val;
          Object[] valArr = (Object[]) val;
          StringBuilder templateName = new StringBuilder();
          for ( int i = 0 ; i < valArr.length ; i++ ) {
            templateName.append(valArr[i]);
          }
          setExtendedEmailTemplate((EmailTemplate) ((DAO) x_.get("emailTemplateDAO")).find(EQ(EmailTemplate.NAME,templateName.toString())));
          if ( extendedEmailTemplate_ == null ) {
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x_.get("logger");
            logger.error("Extended template not found " + val);
          }
          return val;
        }
      };
      grammar.addAction("EXTENDS", extendsAction);


      grammar.addSymbol("BLOCK_CONTENT", new Seq1(7,
        Literal.create("{%"),
        Whitespace.instance(),
        Literal.create("block"),
        Whitespace.instance(),
        Literal.create("content"),
        Whitespace.instance(),
        Literal.create("%}"),
        new Repeat(new Until(new Seq(Literal.create("{%"), Whitespace.instance(), Literal.create("endblock")))),
        Literal.create("{%"),
        Whitespace.instance(),
        Literal.create("endblock"),
        Whitespace.instance(),
        Literal.create("content"),
        Whitespace.instance(),
        Literal.create("%}")
      ));
      Action blockContentAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
        Object[] valArr = (Object[]) val;
          for ( int i = 0 ; i < valArr.length ; i++ ) {
            getBlockContentSb().append(valArr[i]);
          }
          return val;
        }
      };
      grammar.addAction("BLOCK_CONTENT", blockContentAction);


      grammar.parseString(body, "");
      `
    },
    {
      name: 'joinTemplates',
      javaCode: `
      Grammar grammar = new Grammar();
      grammar.addSymbol("START", grammar.sym("markup"));
      grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("SUPER_BLOCK_CONTENT"),
        grammar.sym("ANY_CHAR"))));
      Action markup = new Action() {
        @Override
        public Object execute(Object value, ParserContext x) {
          return getFinalSb().toString();
        }
      };
      grammar.addAction("markup", markup);


      // ANY_KEY symbol applies to any char that doesn't match any other pattern
      grammar.addSymbol("ANY_CHAR", AnyChar.instance());
      Action anyCharAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          getFinalSb().append(val);
          return val;
        }
      };
      grammar.addAction("ANY_CHAR", anyCharAction);

      // ANY_KEY symbol applies to any char that doesn't match any other pattern
      grammar.addSymbol("SUPER_BLOCK_CONTENT", new Seq(
        Literal.create("{%"),
        Whitespace.instance(),
        Literal.create("block content"),
        Whitespace.instance(),
        Literal.create("%}"),
        Literal.create("{%"),
        Whitespace.instance(),
        Literal.create("endblock content"),
        Whitespace.instance(),
        Literal.create("%}")
      ));
      Action superBlockAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          getFinalSb().append(getBlockContentSb());
          return val;
        }
      };
      grammar.addAction("SUPER_BLOCK_CONTENT", superBlockAction);
      grammar.parseString(getExtendedEmailTemplate().getBody(), "");
      `
    }
  ]
});
