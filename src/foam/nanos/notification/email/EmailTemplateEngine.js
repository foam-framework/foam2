/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateEngine',

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
//    {
//      class: 'Object',
//      javaType: 'java.lang.StringBuilder',
//      name: 'blockContentSb',
//      javaFactory: `return new StringBuilder();`
//    },
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
          grammar.sym("ANY_CHAR"), grammar.sym("INCLUDE"), grammar.sym("INCLUDE_CONTENT"))));
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


        /* INCLUDE symbol syntax: "qwerty <include name="templ_name"/> */
        Parser include = new Seq1(7,
          Literal.create("<include"),
          Whitespace.instance(),
          Literal.create("template"),
          Whitespace.instance(),
          Literal.create("="),
          Whitespace.instance(),
          Literal.create("'"),
          new Repeat(new Until(Literal.create("'"))),
          Whitespace.instance(),
          Literal.create("'"),
          Whitespace.instance(),
          Literal.create("/>"));

        grammar.addSymbol("INCLUDE", include);
        Action includeAction  = new Action() {
          @Override
          public Object execute(Object val, foam.lib.parse.ParserContext x) {
            Object[] valArr = (Object[]) val;
            StringBuilder templateName = new StringBuilder();
            for ( int i = 0 ; i < valArr.length ; i++ ) {
              templateName.append(valArr[i]);
            }
            EmailTemplate superTempl = (EmailTemplate) ((DAO) x_.get("emailTemplateDAO")).find(EQ(EmailTemplate.NAME,templateName.toString()));
            StringPStream finalValPs = new StringPStream();
            finalValPs.setString(superTempl.getBody());
            PStream ret = ((Parser) grammar.sym("markup")).parse(finalValPs, new ParserContextImpl());
            getSb().append(ret.value());
            return val;
          }
        };
        grammar.addAction("INCLUDE", includeAction);

        /* INCLUDE_CONTENT symbol syntax: "qwerty <include name="templ_name"> */
        Parser includeContent = new Seq(
          Literal.create("<include template"),
          new Until(Literal.create("</include>"))
          );
        grammar.addSymbol("INCLUDE_CONTENT", includeContent);
        Action includeContentAction  = new Action() {
          @Override
          public Object execute(Object val, foam.lib.parse.ParserContext x) {
            getSb().append(getFinalSb());
            return val;
          }
        };
        grammar.addAction("INCLUDE_CONTENT", includeContentAction);

        return grammar;
      `
    }
  ],

  methods: [
    {
      name: 'renderTemplate',
      args: [
        { name: 'id', type: 'String' }
      ],
      type: 'StringBuilder',
      javaCode: `

      // if the template doesn't extend any other template, parse the original body.
      // Otherwise join two templates and then parse
//      if ( ! isMultiTemplated(body) ) {
//        getGrammar().parseString(body, "");
//      }
//      else {
//        getGrammar().parseSb(getFinalSb(), "");
//      }
      EmailTemplate template = (EmailTemplate) ((DAO) x_.get("emailTemplateDAO")).find(id);
      extendedEmailTemplate_ = template;
//      while ( extendedEmailTemplate_ != null && template != extendedEmailTemplate_ ) {
//        template = extendedEmailTemplate_;
        joinTemplates(template.getBody());
//        if ( template == extendedEmailTemplate_ ) return;
//      }

      getGrammar().parseString(template.getBody(), "");
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

//      extractSuperEmailTemplateAndBlockContent(body);

//      if ( getBlockContentSb().length() == 0 ||
//              getExtendedEmailTemplate() == null ) return false;

//      return joinTemplates(body);

      return true;
      `
    },
    {
      name: 'joinTemplates',
      args: [
        { name: 'body', type: 'String' }
      ],
//      type: 'Boolean',
      javaCode: `
      setExtendedEmailTemplate(null);
      StringBuilder blockContentSb = new StringBuilder();
      StringBuilder tempSb = new StringBuilder();
      Grammar grammar = new Grammar();
      grammar.addSymbol("START", grammar.sym("markup"));

      grammar.addSymbol("markup", new Repeat0(new Alt(
              grammar.sym("INCLUDE_CONTENT"), grammar.sym("ANY_CHAR"))));

      grammar.addSymbol("ANY_CHAR", AnyChar.instance());
      Action anyAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
//          tempSb.append(val);
          return val;
        }
      };
      grammar.addAction("ANY_CHAR", anyAction);

      /* INCLUDE_CONTENT symbol syntax: "qwerty <include name="templ_name"> */
      Parser include = new Seq2(7, 13,
        Literal.create("<include"),
        Whitespace.instance(),
        Literal.create("template"),
        Whitespace.instance(),
        Literal.create("="),
        Whitespace.instance(),
        Literal.create("'"),
        new Repeat(new Until(Literal.create("'"))),
        Whitespace.instance(),
        Literal.create("'"),
        Whitespace.instance(),
        Literal.create(">"),
        Whitespace.instance(),
        new Repeat(new Until(Literal.create("</include>"))),
        Literal.create("</include>")
        );
      grammar.addSymbol("INCLUDE_CONTENT", include);
      Action includeContentAction  = new Action() {
        @Override
        public Object execute(Object val, foam.lib.parse.ParserContext x) {
          Object[] valArr = (Object[]) val;
          StringBuilder ifCond = new StringBuilder();
          Object[] val0 = (Object[]) valArr[0];
          StringBuilder templateName = new StringBuilder();
          for ( int i = 0 ; i < val0.length ; i++ ) {
            templateName.append(val0[i]);
          }
          extendedEmailTemplate_ = ((EmailTemplate) ((DAO) x_.get("emailTemplateDAO")).find(EQ(EmailTemplate.NAME,templateName.toString())));
          if ( extendedEmailTemplate_ == null ) {
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x_.get("logger");
            logger.error("Extended template not found " + val);
          }
          Object[] val1 = (Object[]) valArr[1];
          for ( int i = 0 ; i < val1.length ; i++ ) {
            blockContentSb.append(val1[i]);
          }
          return val;
        }
      };
      grammar.addAction("INCLUDE_CONTENT", includeContentAction);

      grammar.parseString(body, "");

      if ( blockContentSb.length() == 0 ||
        extendedEmailTemplate_ == null ) return;

      getFinalSb().append(tempSb);

      Grammar joiningGrammar = new Grammar();
      joiningGrammar.addSymbol("START", joiningGrammar.sym("markup"));
      joiningGrammar.addSymbol("markup", new Repeat0(new Alt(joiningGrammar.sym("SUPER_BLOCK_CONTENT"),
        joiningGrammar.sym("ANY_CHAR"))));


      // ANY_KEY symbol applies to any char that doesn't match any other pattern
      joiningGrammar.addSymbol("ANY_CHAR", AnyChar.instance());
      Action anyCharAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          getFinalSb().append(val);
          return val;
        }
      };
      joiningGrammar.addAction("ANY_CHAR", anyCharAction);

      // ANY_KEY symbol applies to any char that doesn't match any other pattern
      joiningGrammar.addSymbol("SUPER_BLOCK_CONTENT", new Seq(
        Literal.create("<"),
        Whitespace.instance(),
        Literal.create("content"),
        Whitespace.instance(),
        Literal.create(">"),
        Literal.create("</"),
        Whitespace.instance(),
        Literal.create("content"),
        Whitespace.instance(),
        Literal.create(">")
      ));
      Action superBlockAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          getFinalSb().append(blockContentSb);
          return val;
        }
      };
      joiningGrammar.addAction("SUPER_BLOCK_CONTENT", superBlockAction);
      joiningGrammar.parseString(extendedEmailTemplate_.getBody(), "");
      joinTemplates(extendedEmailTemplate_.getBody());
      `
    }
  ]
});
