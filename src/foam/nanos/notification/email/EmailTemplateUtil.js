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
    'foam.lib.parse.GrammarAction',
    'foam.lib.parse.*',
    'foam.lib.json.AnyKeyParser',
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
        grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("SIMPLE_VAL"), grammar.sym("ANY_KEY")),Whitespace.instance()));
        grammar.addSymbol("SIMPLE_VAL", new Seq1(2, Literal.create("{{"), Whitespace.instance(), new Repeat0(new AnyKeyParser()), Whitespace.instance() ,Literal.create("}}") ));
//        grammar.addSymbol("SIMPLE_VAL", new Seq1(2, Literal.create("{%"), Whitespace.instance(), new Repeat0(new AnyKeyParser()), Whitespace.instance() ,Literal.create("}}") ));


        // define actions for every symbol
        GrammarAction action = new GrammarAction() {
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
        grammar.addSymbol("ANY_KEY", new AnyKeyParser());
        GrammarAction anyAction = new GrammarAction() {
          @Override
          public Object execute(Object val, ParserContext x) {
            getSb().append(val);
            return val;
          }
        };

        GrammarAction markup = new GrammarAction() {
          @Override
          public Object execute(Object value, ParserContext x) {
            return getSb().toString();
          }
        };
        grammar.addAction("SIMPLE_VAL", action);
        grammar.addAction("ANY_KEY", anyAction);
        grammar.addAction("markup", markup);
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
      ],
      type: 'String',
      javaCode: `
      setValues(values);
      ParserContext parserX = new ParserContextImpl();
      getGrammar().parseString(body, "", parserX);
      System.out.println(getSb().toString());
      return getSb().toString();
      `
    }
  ]
});
