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
      class: 'Boolean',
      name: 'isNextTemplateExtending'
    },
    {
      class: 'Map',
      name: 'values',
      documentation: `map of values of values for simple values where {{ key }} will be replaced with value`
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
        grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("IF_ELSE"),
          grammar.sym("IF"), grammar.sym("SIMPLE_VAL"), grammar.sym("ANY_CHAR"))));
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
          new Until(Literal.create("%}")),
          Whitespace.instance(),
          Literal.create("%}"),
          new Until(Literal.create("{%")),
          Literal.create("{%"),
          Whitespace.instance(),
          Literal.create("else"),
          Whitespace.instance(),
          Literal.create("%}"),
          new Until(Literal.create("{%")),
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
          new Until(Literal.create("%}")),
          Whitespace.instance(),
          Literal.create("%}"),
          Whitespace.instance(),
          new Until(Literal.create("{%")),
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
      name: 'renderTemplateById',
      args: [
        { name: 'id', type: 'String' }
      ],
      type: 'StringBuilder',
      javaCode: `
      EmailTemplate template = (EmailTemplate) ((DAO) x_.get("emailTemplateDAO")).find(id);
      return renderTemplateStr(template.getBody());
      `
    },
    {
      name: 'renderTemplateStr',
      args: [
        { name: 'str', type: 'String' }
      ],
      type: 'StringBuilder',
      javaCode: `
      StringBuilder joinedTempl = joinTemplates(str);
      getGrammar().parseSb(joinedTempl, "");
      return getSb();
      `
    },
    {
      name: 'outputContent',
      args: [
        { name: 'body', type: 'String' },
        { name: 'content', type: 'String' }
      ],
      type: 'StringBuilder',
      javaCode: `
      StringBuilder ret = new StringBuilder();
      Grammar grammar = new Grammar();
      grammar.addSymbol("START", grammar.sym("markup"));
      grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("SUPER_BLOCK_CONTENT"),
        grammar.sym("ANY_CHAR"))));

      grammar.addSymbol("ANY_CHAR", AnyChar.instance());
      Action anyCharAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          ret.append(val);
          return val;
        }
      };
      grammar.addAction("ANY_CHAR", anyCharAction);

      /* SUPER_BLOCK_CONTENT finds pattern <content></content> and inserts content
      from extending template */
      grammar.addSymbol("SUPER_BLOCK_CONTENT", new Seq(
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
          ret.append(content);
          return val;
        }
      };
      grammar.addAction("SUPER_BLOCK_CONTENT", superBlockAction);

      grammar.parseString(body, "");

      return ret;
      `
    },
    {
      name: 'joinTemplates',
      args: [
        { name: 'body', type: 'String' }
      ],
      type: 'StringBuilder',
      documentation: `joins two templates where one extends another
      (e.g. <include template = "tempalte_name"> extending template content </include>).
      In case when there is more than one template extended, joinTemplates is called recursively`,
      javaCode: `
      StringBuilder tempSb = new StringBuilder();
      setIsNextTemplateExtending(false);
      Grammar grammar = new Grammar();
      grammar.addSymbol("START", grammar.sym("markup"));

      grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("INCLUDE_CONTENT"),
      grammar.sym("ANY_CHAR"))));

      grammar.addSymbol("ANY_CHAR", AnyChar.instance());
      Action anyAction = new Action() {
        @Override
        public Object execute(Object val, ParserContext x) {
          tempSb.append(val);
          return val;
        }
      };
      grammar.addAction("ANY_CHAR", anyAction);

      /* INCLUDE_CONTENT symbol syntax: "qwerty <include name="templ_name"> some content
        </include>*/
      Parser include = new Seq2(7, 11,
        Literal.create("<include"),
        Whitespace.instance(),
        Literal.create("template"),
        Whitespace.instance(),
        Literal.create("="),
        Whitespace.instance(),
        Literal.create("'"),
        new Until(Literal.create("'")),
        Whitespace.instance(),
        Literal.create(">"),
        Whitespace.instance(),
        new Until(Literal.create("</include>"))
        );
      grammar.addSymbol("INCLUDE_CONTENT", include);
      Action includeContentAction  = new Action() {
        @Override
        public Object execute(Object val, foam.lib.parse.ParserContext x) {
          Object[] valArr = (Object[]) val;
          Object[] tempVal = (Object[]) valArr[0];
          Object[] val0 = (Object[]) tempVal[0];
          StringBuilder templateName = new StringBuilder();
          for ( int i = 0 ; i < val0.length ; i++ ) {
            templateName.append(val0[i]);
          }
          EmailTemplate extendedEmailTemplate = ((EmailTemplate) ((DAO) x_.get("emailTemplateDAO")).find(EQ(EmailTemplate.NAME,templateName.toString())));
          if ( extendedEmailTemplate == null ) {
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x_.get("logger");
            logger.error("Extended template not found " + val);
            return val;
          }
          StringBuilder content = new StringBuilder();
          tempVal = (Object[]) valArr[1];
          Object[] val1 = (Object[]) tempVal[0];
          for ( int i = 0 ; i < val1.length ; i++ ) {
            content.append(val1[i]);
          }
          String body = extendedEmailTemplate.getBody();
          setIsNextTemplateExtending(body.contains("<include template=") || body.contains("<include template ="));
          tempSb.append(outputContent(extendedEmailTemplate.getBody(), content.toString()));
          return val;
        }
      };
      grammar.addAction("INCLUDE_CONTENT", includeContentAction);

      grammar.parseString(body, "");

      if ( ! getIsNextTemplateExtending() ) return tempSb;
      return joinTemplates(tempSb.toString());
      `
    }
  ]
});
