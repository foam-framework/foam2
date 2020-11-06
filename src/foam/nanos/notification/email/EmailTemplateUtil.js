/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateUtil',

  javaImports: [
    'foam.java.Grammar',
    'foam.java.GrammarAction',
    'foam.lib.parse.*',
    'foam.lib.json.AnyKeyParser',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.java.Grammar',
      name: 'grammar',
      javaFactory: `
        Grammar grammar = new Grammar();
        Map symbols = new HashMap();
        symbols.put("START", grammar.sym("markup"));
        symbols.put("markup", new Repeat0(new Alt(grammar.sym("simple_val"), grammar.sym("any_key"))));
        symbols.put("simple_val", new Seq1(1, Literal.create("{{"), new Repeat0(new AnyKeyParser()), Literal.create("}}")));
        GrammarAction action = new GrammarAction() {
          @Override
          public Object execute(Object value, ParserContext x) {
            System.out.println("****SIMPLE VALUE****" + value);
            return value;
          }
        };
        symbols.put("any_key", new AnyKeyParser());
        GrammarAction anyAction = new GrammarAction() {
          @Override
          public Object execute(Object value, ParserContext x) {
            System.out.println("***ANY KEY***" + value);
            return value;
          }
        };
        grammar.setSymbols(new HashMap());
        grammar.setSymbols(symbols);
        grammar.addAction("simple_val", action);
        grammar.addAction("any_key", anyAction);
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
      ParserContext x = new ParserContextImpl();
      PStream ret = getGrammar().parseString(body, "", x);
      return (String) ret.value();
      `
    }
  ]
});
