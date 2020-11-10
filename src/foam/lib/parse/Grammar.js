/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.lib.parse',
  name: 'Grammar',

  javaImports: [
    'foam.lib.parse.Parser',
    'foam.lib.parse.StringPStream',
    'java.util.Map',
    'foam.lib.parse.SymbolParser'
  ],

  requires: [
    'foam.parse.ParserWithAction'
  ],

  properties: [
    {
      class: 'Map',
      name: 'symbols',
      javaFactory: 'return new java.util.HashMap<String, foam.lib.parse.Parser>();'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Parser',
      name: 'lastStart'
    }
  ],

  methods: [
    {
      name: 'addSymbol',
      args: [
        { name: 'symName', type: 'String' },
        { name: 'symParser', type: 'Parser' }
      ],
      javaCode: `
      getSymbols().put(symName, symParser);
      `
    },
    {
      name: 'parseString',
      type: 'foam.lib.parse.PStream',
      args: [
        { name: 'str', type: 'String' },
        { name: 'optName', type: 'String' },
        { name: 'x',  javaType: 'foam.lib.parse.ParserContext' }
      ],
      javaCode: `
if ( optName.equals("") ) optName = "START";
ps.setString(str);
PStream temp = ps.apply((Parser)getSymbols().get(optName), x);
return temp;
      `
    },
    {
      name: 'sym',
      args: [ { name: 'name', type: 'String' } ],
      type: 'foam.lib.parse.Parser',
      javaCode: `
      SymbolParser symParser = new SymbolParser();
      symParser.setSymbolName(name);
      symParser.setSymbols(getSymbols());
      return symParser;
      `
    },
    {
      name:'addActions',
      args: [
        { name: 'name', type: 'String'},
        { name: 'action', type: 'foam.lib.parse.GrammarAction' }
      ],
      javaCode: `

      `
    },
    {
      name:'addAction',
      args: [
        { name: 'name', type: 'String'},
        { name: 'action', type: 'foam.lib.parse.GrammarAction' }
      ],
      javaCode: `
Map symbols = getSymbols();
GrammarParser grParser = new GrammarParser();
grParser.setAction(action);
grParser.setParser((Parser) symbols.get(name));
symbols.put(name, grParser);
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        public StringPStream ps = new StringPStream();
        `);
      }
    }
  ]
});

foam.INTERFACE({
  package: 'foam.lib.parse',
  name: 'GrammarAction',
  documentation: '',
  methods: [
    {
      name: 'execute',
      args: [
        { name: 'val', type: 'Object' },
        { name: 'x', type: 'foam.lib.parse.ParserContext' }
      ],
      type: 'Object'
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.parse',
  name: 'GrammarParser',
  implements: [ 'foam.lib.parse.Parser' ],
  documentation: '',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Parser',
      name: 'parser'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.GrammarAction',
      name: 'action'
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
ps = getParser().parse(ps, x);
if ( ps != null ) ps.setValue(getAction().execute(ps.value(), x));
return ps;
      `
    }
  ]
});
