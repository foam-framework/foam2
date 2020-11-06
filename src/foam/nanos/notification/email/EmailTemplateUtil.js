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
              symbols.put("SIMPLE_VAL", new Seq1(1, Literal.create("{{"), new Repeat0(new AnyKeyParser()), Literal.create("}}")));
        GrammarAction action = new GrammarAction() {
          @Override
          public Object execute(Object value, ParserContext x) {
            System.out.println(value);
            return value;
          }
        };
        grammar.setSymbols(new HashMap());
        grammar.setSymbols(symbols);
        grammar.addAction("test", action);
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
        return body;
      `
    }
  ]
});
