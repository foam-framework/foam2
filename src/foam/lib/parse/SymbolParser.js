/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.lib.parse',
  name: 'SymbolParser',
  implements: [ 'foam.lib.parse.Parser' ],

  javaImports: [
    'foam.lib.parse.Parser',
    'foam.lib.parse.StringPStream',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'Map',
      name: 'symbols',
    },
    {
      class: 'String',
      name: 'symbolName'
    }
  ],

  methods: [
    {
      name: 'parse',
      type: 'foam.lib.parse.PStream',
      args: [
        {
          name: 'ps',
          type: 'foam.lib.parse.PStream'
        },
        {
          name: 'x',
          javaType: 'foam.lib.parse.ParserContext'
        },
      ],
      javaCode: `
      Parser parser = (Parser) getSymbols().get(getSymbolName());
ps = parser.parse(ps, x);
return ps;
      `
    }
  ]
});
